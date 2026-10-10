"""Replan orchestration: current roadmap + mastered nodes -> revised roadmap.

Reuses parsing/validation/scheduling helpers from roadmap_workflow.
"""
import logging
from typing import Any, Dict

from pydantic import ValidationError

from ..prompts.replan_prompt import REPLAN_INPUT_VARS, replan_prompt
from ..schemas.roadmap import ReplanRequest, RoadmapResponse
from ..services.llm_service import get_llm
from .roadmap_workflow import (
    LLMFailure,
    MAX_CORRECTION_ATTEMPTS,
    RoadmapValidationError,
    normalize_phases,
    parse_llm_json,
    recalculate_plan,
    validate_graph,
)

log = logging.getLogger("replan_workflow")


def _known_still_present(data: Dict[str, Any], known_ids: set) -> list:
    return [n.get("id") for n in data.get("nodes", []) or [] if n.get("id") in known_ids]


def replan_roadmap(request: ReplanRequest, llm=None) -> RoadmapResponse:
    """Execute the replan pipeline and return a validated revised roadmap."""
    hours = request.hours_per_week or request.roadmap.plan.hours_per_week
    months = request.timeline_months or request.roadmap.plan.timeline_months
    known_ids = list(dict.fromkeys(request.known_node_ids))
    known_set = set(known_ids)

    titles = {n.id: n.title for n in request.roadmap.nodes}
    unknown = [k for k in known_ids if k not in titles]
    if unknown:
        raise RoadmapValidationError(f"Unknown node ids in replan request: {unknown}")

    base_values = {
        "roadmap_json": request.roadmap.model_dump_json(),
        "known_ids": ", ".join(known_ids),
        "known_titles": ", ".join(titles[k] for k in known_ids),
        "hours_per_week": hours,
        "timeline_months": months,
        "feedback": "",
    }
    missing = [k for k in REPLAN_INPUT_VARS if k not in base_values]
    if missing:
        raise RoadmapValidationError(f"Missing replan prompt variables: {missing}")

    llm = llm if llm is not None else get_llm()

    def invoke(values: Dict[str, Any]) -> Dict[str, Any]:
        try:
            result = (replan_prompt | llm).invoke(values)
        except Exception as e:
            log.exception("Replan LLM invocation failed")
            raise LLMFailure(f"Replan LLM invocation failed: {e}") from e
        data = parse_llm_json(getattr(result, "content", str(result)))
        for i, e in enumerate(data.get("edges", []) or []):
            e.setdefault("id", f"edge-{i + 1}")
        return normalize_phases(data)

    data = invoke(base_values)
    errors = validate_graph(data)
    leftover = _known_still_present(data, known_set)
    if leftover:
        errors.append(f"Mastered nodes still present (must be removed/rewired): {leftover}")

    if errors:
        log.warning("Replan first-pass failed (%d), requesting correction.", len(errors))
        values = dict(base_values, feedback=(
            "CORRECTION REQUIRED — your previous revision failed validation:\n"
            + "\n".join(f"- {e}" for e in errors)
            + "\nFix ALL of them and return ONLY the corrected JSON object."
        ))
        for _ in range(MAX_CORRECTION_ATTEMPTS):
            data = invoke(values)
            errors = validate_graph(data)
            leftover = _known_still_present(data, known_set)
            if leftover:
                errors.append(f"Mastered nodes still present: {leftover}")
            if not errors:
                break
        if errors:
            raise RoadmapValidationError(f"Replanned roadmap failed validation: {errors}")

    data = recalculate_plan(data, hours, months)
    try:
        return RoadmapResponse.model_validate(data)
    except ValidationError as e:
        raise RoadmapValidationError(f"Replanned roadmap failed schema validation: {e}") from e
