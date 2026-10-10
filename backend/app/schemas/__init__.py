"""Legacy demo-endpoint schemas (kept for the existing frontend contract).

The new AI pipeline models live in :mod:`app.schemas.roadmap`.
"""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ProfileParseRequest(BaseModel):
    goal: str = Field(..., examples=["Frontend Engineer at a SaaS unicorn"])
    background_text: str = Field(..., examples=["I know HTML, CSS, basic JS. Built portfolio + todo app."])


class ProfileParseResponse(BaseModel):
    known_skills: List[str] = []
    projects: List[str] = []
    level: str = "Student"
    summary: str = ""
    timeline_fit: str = ""
    llm_used: bool = False


class RoadmapGenerateRequest(BaseModel):
    goal: str
    background_text: Optional[str] = ""
    hours_per_week: int = 10
    timeline_months: int = 6
    known_skills: List[str] = []
    level: Optional[str] = "Student"


class NodeDetailRequest(BaseModel):
    node_id: str
    goal: str = ""
    label: str = ""


class ReplanRequest(BaseModel):
    nodes: List[Dict[str, Any]]
    known_skills: List[str] = []
