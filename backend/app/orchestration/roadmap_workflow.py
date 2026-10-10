"""Orchestration workflow: prompt -> LLM -> parse -> validate -> return.

Owns the complete AI pipeline. The controller never touches the LLM.
"""
import json
import logging
from typing import Any, Dict, List

from pydantic import ValidationError

from ..prompts.roadmap_prompt import roadmap_prompt, PROMPT_INPUT_VARS
from ..schemas.roadmap import RoadmapRequest, RoadmapResponse
from ..services.llm_service import get_llm

log = logging.getLogger("roadmap_workflow")

WEEKS_PER_MONTH = 4.33
MAX_CORRECTION_ATTEMPTS = 1


class LLMFailure(RuntimeError):
    """Upstream LLM call or output parsing failed."""


class RoadmapValidationError(ValueError):
    """Parsed roadmap failed Python-side graph/schedule validation."""


# ---------- parsing ----------

def _strip_fences(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        t = t.split("\n", 1)[1] if "\n" in t else t[3:]
        if t.rstrip().endswith("```"):
            t = t.rstrip()[: -3]
    return t.strip()


def parse_llm_json(text: str) -> Dict[str, Any]:
    try:
        data = json.loads(_strip_fences(text))
    except json.JSONDecodeError as e:
        raise LLMFailure(f"LLM did not return valid JSON: {e}") from e
    if not isinstance(data, dict):
        raise LLMFailure("LLM JSON output was not an object.")
    return data


# ---------- validation ----------

def _has_cycle(node_ids: List[str], prereq_map: Dict[str, List[str]]) -> bool:
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {n: WHITE for n in node_ids}

    def visit(n: str) -> bool:
        color[n] = GRAY
        for p in prereq_map.get(n, []):
            if color.get(p, BLACK) == GRAY:
                return True
            if color.get(p, BLACK) == WHITE and visit(p):
                return True
        color[n] = BLACK
        return False

    return any(visit(n) for n in node_ids if color[n] == WHITE)


def validate_graph(data: Dict[str, Any]) -> List[str]:
    """Return a list of problems (empty = valid). Pure function, unit-tested."""
    errors: List[str] = []
    nodes = data.get("nodes", []) or []
    edges = data.get("edges", []) or []
    phases = data.get("phases", []) or []

    node_ids = [n.get("id") for n in nodes]
    if len(set(node_ids)) != len(node_ids):
        errors.append("Node IDs are not unique.")
    if not node_ids:
        errors.append("Roadmap contains no nodes.")

    phase_ids = {p.get("id") for p in phases}
    node_set = set(node_ids)
    for p in phases:
        for nid in p.get("node_ids", []) or []:
            if nid not in node_set:
                errors.append(f"Phase {p.get('id')!r} lists unknown node {nid!r}.")
    for n in nodes:
        if n.get("phase_id") not in phase_ids:
            errors.append(f"Node {n.get('id')!r} references unknown phase {n.get('phase_id')!r}.")
        for p in n.get("prerequisites", []) or []:
            if p not in node_ids:
                errors.append(f"Node {n.get('id')!r} has unknown prerequisite {p!r}.")
        if (n.get("end_week") or 0) < (n.get("start_week") or 0):
            errors.append(f"Node {n.get('id')!r} has end_week before start_week.")
        if (n.get("estimated_hours") or 0) <= 0:
            errors.append(f"Node {n.get('id')!r} has non-positive estimated_hours.")

    for e in edges:
        if e.get("source") not in node_set:
            errors.append(f"Edge {e.get('id')!r} references unknown source {e.get('source')!r}.")
        if e.get("target") not in node_set:
            errors.append(f"Edge {e.get('id')!r} references unknown target {e.get('target')!r}.")

    prereq_map = {n.get("id"): list(n.get("prerequisites", []) or []) for n in nodes}
    if node_ids and _has_cycle(node_ids, prereq_map):
        errors.append("Dependency graph contains a cycle.")

    # schedule respects prerequisites
    weeks = {n.get("id"): (n.get("start_week"), n.get("end_week")) for n in nodes}
    for e in edges:
        if e.get("relationship", "prerequisite") == "prerequisite":
            s, t = e.get("source"), e.get("target")
            if s in weeks and t in weeks and weeks[t][0] < weeks[s][0]:
                errors.append(
                    f"Schedule violation: {t!r} starts before its prerequisite {s!r}."
                )
    return errors


def recalculate_plan(data: Dict[str, Any], hours_per_week: float, timeline_months: int) -> Dict[str, Any]:
    """Recompute time-budget feasibility in Python (never trust LLM arithmetic)."""
    nodes = data.get("nodes", []) or []
    estimated = round(sum(float(n.get("estimated_hours", 0) or 0) for n in nodes), 2)
    available = round(float(hours_per_week) * int(timeline_months) * WEEKS_PER_MONTH, 2)
    feasible = estimated <= available
    plan = data.get("plan", {}) or {}
    plan.update(
        {
            "timeline_months": int(timeline_months),
            "hours_per_week": float(hours_per_week),
            "estimated_total_hours": estimated,
            "available_total_hours": available,
            "feasibility": "feasible" if feasible else "over_capacity",
            "capacity_shortfall_hours": 0 if feasible else round(estimated - available, 2),
        }
    )
    if not feasible:
        lims = list(plan.get("limitations", []) or [])
        lims.append(
            f"Estimated effort ({estimated}h) exceeds capacity ({available}h) by "
            f"{round(estimated - available, 2)}h. Consider a longer timeline or reduced scope."
        )
        plan["limitations"] = lims
    data["plan"] = plan
    return data


# ---------- workflow ----------

def normalize_phases(data: Dict[str, Any]) -> Dict[str, Any]:
    """Backfill phase render order by array index when the LLM omits it."""
    for i, p in enumerate(data.get("phases", []) or []):
        if not p.get("order"):
            p["order"] = i + 1
    return data

def _invoke_llm(prompt_values: Dict[str, Any], llm) -> str:
    chain = roadmap_prompt | llm
    try:
        result = chain.invoke(prompt_values)
    except Exception as e:
        log.exception("LLM invocation failed")
        raise LLMFailure(f"LLM invocation failed: {e}") from e
    return getattr(result, "content", str(result))


def generate_roadmap(request: RoadmapRequest, llm=None) -> RoadmapResponse:
    """Execute the full pipeline and return a validated RoadmapResponse."""
    prompt_values = {
        "target_role": request.target_role,
        "company_type": request.company_type,
        "experience_level": request.experience_level,
        "background": request.background,
        "hours_per_week": request.hours_per_week,
        "timeline_months": request.timeline_months,
    }
    missing = [k for k in PROMPT_INPUT_VARS if k not in prompt_values]
    if missing:
        raise RoadmapValidationError(f"Missing prompt variables: {missing}")

    llm = llm if llm is not None else get_llm()  # raises LLMConfigError if unconfigured

    raw = _invoke_llm(prompt_values, llm)
    data = parse_llm_json(raw)
    data = normalize_phases(data)

    # ensure every edge has a stable id (be lenient only here)
    for i, e in enumerate(data.get("edges", []) or []):
        e.setdefault("id", f"edge-{i + 1}")

    errors = validate_graph(data)
    if errors:
        log.warning("First-pass validation failed (%d), requesting correction.", len(errors))
        correction = (
            "Your previous JSON failed validation with these errors:\n"
            + "\n".join(f"- {e}" for e in errors)
            + "\nFix ALL of them and return ONLY the corrected JSON object."
        )
        for _ in range(MAX_CORRECTION_ATTEMPTS):
            raw = _invoke_llm({**prompt_values, "background": request.background + "\n\n" + correction}, llm)
            data = parse_llm_json(raw)
            data = normalize_phases(data)
            for i, e in enumerate(data.get("edges", []) or []):
                e.setdefault("id", f"edge-{i + 1}")
            errors = validate_graph(data)
            if not errors:
                break
        if errors:
            raise RoadmapValidationError(f"LLM roadmap failed validation: {errors}")

    data = recalculate_plan(data, request.hours_per_week, request.timeline_months)

    try:
        return RoadmapResponse.model_validate(data)
    except ValidationError as e:
        raise RoadmapValidationError(f"LLM roadmap failed schema validation: {e}") from e
