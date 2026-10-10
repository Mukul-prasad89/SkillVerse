"""Tests: request/response schemas, graph validation, scheduling math, workflow (mocked LLM)."""
import json

import pytest
from langchain_core.runnables import RunnableLambda
from pydantic import ValidationError

from app.orchestration.roadmap_workflow import (
    LLMFailure,
    RoadmapValidationError,
    normalize_phases,
    parse_llm_json,
    recalculate_plan,
    validate_graph,
    generate_roadmap,
)
from app.orchestration.replan_workflow import replan_roadmap
from app.prompts.roadmap_prompt import PROMPT_INPUT_VARS, roadmap_prompt
from app.prompts.replan_prompt import REPLAN_INPUT_VARS, replan_prompt
from app.schemas.roadmap import ReplanRequest, RoadmapRequest, RoadmapResponse


def valid_request(**kw):
    base = {
        "target_role": "Frontend Engineer",
        "company_type": "SaaS startup",
        "experience_level": "Beginner",
        "background": "I know HTML, CSS and basic JavaScript. Built a portfolio and a weather app.",
        "hours_per_week": 10,
        "timeline_months": 6,
    }
    base.update(kw)
    return RoadmapRequest(**base)


def sample_roadmap() -> dict:
    return {
        "target": {"role": "Frontend Engineer", "company_type": "SaaS startup", "experience_level": "Beginner"},
        "student_profile": {
            "current_skills": [{"name": "HTML", "proficiency": "beginner", "evidence": "portfolio", "confidence": "medium"}],
            "existing_projects": [{"name": "Portfolio", "description": "site", "demonstrated_skills": ["HTML"], "gaps": ["JS"]}],
            "strengths": ["consistent"],
            "knowledge_gaps": ["React"],
            "assumptions": [],
        },
        "plan": {"timeline_months": 6, "hours_per_week": 10, "estimated_total_hours": 60,
                 "available_total_hours": 259.8, "feasibility": "feasible",
                 "capacity_shortfall_hours": 0, "summary": "ok", "limitations": []},
        "phases": [{"id": "phase-1", "name": "Foundations", "description": "", "start_week": 1, "end_week": 4,
                    "node_ids": ["node-1", "node-2"]}],
        "nodes": [
            {"id": "node-1", "type": "skill", "title": "JS Deep Dive", "description": "", "phase_id": "phase-1",
             "priority": "high", "current_proficiency": "beginner", "target_proficiency": "intermediate",
             "estimated_hours": 20, "start_week": 1, "end_week": 2, "status": "not_started",
             "prerequisites": [], "skills": ["JavaScript"], "completion_criteria": ["quiz"],
             "verification_method": "test", "recommended_project": None, "recommended_credentials": [],
             "career_relevance": "core"},
            {"id": "node-2", "type": "project", "title": "Portfolio v2", "description": "", "phase_id": "phase-1",
             "priority": "high", "current_proficiency": "beginner", "target_proficiency": "intermediate",
             "estimated_hours": 40, "start_week": 2, "end_week": 4, "status": "not_started",
             "prerequisites": ["node-1"], "skills": ["React"], "completion_criteria": ["deploy"],
             "verification_method": "review", "recommended_project": "portfolio", "recommended_credentials": [],
             "career_relevance": "proof"},
        ],
        "edges": [{"id": "edge-1", "source": "node-1", "target": "node-2", "relationship": "prerequisite"}],
        "next_actions": [{"node_id": "node-1", "action": "Start JS exercises"}],
    }


class Msg:
    def __init__(self, content):
        self.content = content


def mock_llm(payload: dict):
    return RunnableLambda(lambda _: Msg(json.dumps(payload)))


# ---------- schemas ----------

def test_request_accepts_valid():
    r = valid_request()
    assert r.hours_per_week == 10 and r.timeline_months == 6


@pytest.mark.parametrize("kw", [
    {"hours_per_week": 0}, {"hours_per_week": -5}, {"hours_per_week": 81},
    {"timeline_months": 0}, {"timeline_months": 37},
    {"target_role": ""}, {"background": ""},
])
def test_request_rejects_invalid(kw):
    with pytest.raises(ValidationError):
        valid_request(**kw)


def test_response_schema_accepts_sample():
    assert RoadmapResponse.model_validate(sample_roadmap()).plan.feasibility == "feasible"


def test_prompt_template_vars():
    assert sorted(roadmap_prompt.input_variables) == sorted(PROMPT_INPUT_VARS)
    msgs = roadmap_prompt.format_messages(target_role="a", company_type="b", experience_level="c",
                                          background="d", hours_per_week=1, timeline_months=2)
    assert "TARGET_ROLE: a" in msgs[1].content


# ---------- graph validation ----------

def test_valid_graph_passes():
    assert validate_graph(sample_roadmap()) == []


def test_cycle_detected():
    bad = sample_roadmap()
    bad["nodes"][0]["prerequisites"] = ["node-2"]
    errs = validate_graph(bad)
    assert any("cycle" in e for e in errs)


def test_unknown_refs_detected():
    bad = sample_roadmap()
    bad["nodes"][1]["prerequisites"] = ["node-999"]
    bad["edges"].append({"id": "edge-9", "source": "node-1", "target": "ghost", "relationship": "supports"})
    bad["nodes"][0]["phase_id"] = "phase-999"
    errs = validate_graph(bad)
    assert len(errs) >= 3


def test_schedule_violation_detected():
    bad = sample_roadmap()
    bad["nodes"][1]["start_week"] = 1  # edge says node-1 prerequisite but same start is fine...
    bad["nodes"][1]["start_week"] = 1
    bad["nodes"][0]["start_week"] = 3
    assert any("Schedule violation" in e for e in validate_graph(bad))


def test_phase_unknown_node_detected():
    bad = sample_roadmap()
    bad["phases"][0]["node_ids"] = ["node-1", "node-ghost"]
    assert any("lists unknown node" in e for e in validate_graph(bad))


def test_normalize_phases_backfills_order():
    data = {"phases": [{"id": "phase-1", "order": 0}, {"id": "phase-2"}]}
    out = normalize_phases(data)
    assert [p["order"] for p in out["phases"]] == [1, 2]


def test_normalize_phases_keeps_llm_order():
    data = {"phases": [{"id": "a", "order": 2}, {"id": "b", "order": 1}]}
    assert [p["order"] for p in normalize_phases(data)["phases"]] == [2, 1]


# ---------- scheduling ----------

def test_recalculate_feasible():
    data = recalculate_plan(sample_roadmap(), 10, 6)
    assert data["plan"]["available_total_hours"] == pytest.approx(10 * 6 * 4.33)
    assert data["plan"]["estimated_total_hours"] == 60
    assert data["plan"]["feasibility"] == "feasible"


def test_recalculate_over_capacity():
    data = recalculate_plan(sample_roadmap(), 2, 1)  # ~8.66h available vs 60h needed
    assert data["plan"]["feasibility"] == "over_capacity"
    assert data["plan"]["capacity_shortfall_hours"] == pytest.approx(60 - 2 * 1 * 4.33)
    assert any("exceeds capacity" in lim for lim in data["plan"]["limitations"])


# ---------- parsing + workflow (mocked LLM, never production path) ----------

def test_parse_rejects_non_json():
    with pytest.raises(LLMFailure):
        parse_llm_json("Sure! Here is your roadmap: learn React!")


def test_workflow_happy_path_mocked():
    resp = generate_roadmap(valid_request(), llm=mock_llm(sample_roadmap()))
    assert isinstance(resp, RoadmapResponse)
    assert resp.target.role == "Frontend Engineer"
    assert resp.plan.available_total_hours == pytest.approx(259.8)


def test_workflow_over_capacity_recalculated():
    resp = generate_roadmap(valid_request(hours_per_week=2, timeline_months=1), llm=mock_llm(sample_roadmap()))
    assert resp.plan.feasibility == "over_capacity"
    assert resp.plan.capacity_shortfall_hours > 0


def test_workflow_garbage_output_raises():
    with pytest.raises(LLMFailure):
        generate_roadmap(valid_request(), llm=RunnableLambda(lambda _: Msg("not json at all {")))


# ---------- replan ----------

def valid_replan(**kw):
    base = {"roadmap": sample_roadmap(), "known_node_ids": ["node-1"]}
    base.update(kw)
    return ReplanRequest(**base)


def revised_roadmap() -> dict:
    """node-1 removed, node-2 rewired to a start node."""
    d = sample_roadmap()
    d["nodes"] = [{**n, "prerequisites": [], "start_week": 1, "end_week": 2} if n["id"] == "node-2" else n
                  for n in d["nodes"] if n["id"] != "node-1"]
    d["edges"] = []
    d["phases"][0]["node_ids"] = ["node-2"]
    d["next_actions"] = [{"node_id": "node-2", "action": "Build it"}]
    return d


def test_replan_request_rejects_empty_known():
    with pytest.raises(ValidationError):
        valid_replan(known_node_ids=[])


def test_replan_template_vars():
    assert sorted(replan_prompt.input_variables) == sorted(REPLAN_INPUT_VARS)


def test_replan_removes_known_and_rewires_mocked():
    resp = replan_roadmap(valid_replan(), llm=mock_llm(revised_roadmap()))
    ids = [n.id for n in resp.nodes]
    assert "node-1" not in ids and "node-2" in ids
    assert resp.nodes[0].prerequisites == []


def test_replan_rejects_unknown_ids_without_llm():
    from app.orchestration.replan_workflow import RoadmapValidationError as RVE
    with pytest.raises(RVE):
        replan_roadmap(valid_replan(known_node_ids=["node-ghost"]), llm=mock_llm(revised_roadmap()))


def test_replan_leftover_known_node_raises():
    with pytest.raises(RoadmapValidationError):
        replan_roadmap(valid_replan(), llm=mock_llm(sample_roadmap()))  # still contains node-1
