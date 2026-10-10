"""Pydantic request/response models for the AI Career Roadmapper pipeline."""
from typing import List, Literal, Optional
from pydantic import BaseModel, Field

Proficiency = Literal["not_exposed", "beginner", "intermediate", "advanced", "uncertain"]
NodeType = Literal["skill", "project", "certification", "experience", "interview", "milestone"]
Priority = Literal["high", "medium", "low"]
NodeStatus = Literal["not_started", "in_progress", "completed"]
Feasibility = Literal["feasible", "over_capacity"]
Relationship = Literal["prerequisite", "supports", "demonstrates", "leads_to"]
Confidence = Literal["low", "medium", "high"]


class RoadmapRequest(BaseModel):
    target_role: str = Field(..., min_length=1, max_length=200)
    company_type: str = Field(..., min_length=1, max_length=200)
    experience_level: str = Field(..., min_length=1, max_length=100)
    background: str = Field(..., min_length=1, max_length=5000)
    hours_per_week: float = Field(..., gt=0, le=80)
    timeline_months: int = Field(..., gt=0, le=36)


class Skill(BaseModel):
    name: str
    proficiency: Proficiency
    evidence: str = ""
    confidence: Confidence = "medium"


class ExistingProject(BaseModel):
    name: str
    description: str = ""
    demonstrated_skills: List[str] = []
    gaps: List[str] = []


class StudentProfile(BaseModel):
    current_skills: List[Skill] = []
    existing_projects: List[ExistingProject] = []
    strengths: List[str] = []
    knowledge_gaps: List[str] = []
    assumptions: List[str] = []


class RoadmapPlan(BaseModel):
    timeline_months: int
    hours_per_week: float
    estimated_total_hours: float
    available_total_hours: float
    feasibility: Feasibility
    capacity_shortfall_hours: float = 0
    summary: str = ""
    limitations: List[str] = []


class RoadmapPhase(BaseModel):
    id: str
    name: str
    description: str = ""
    order: int = 0  # explicit render order; workflow backfills by index when 0
    start_week: int = Field(..., ge=1)
    end_week: int = Field(..., ge=1)
    node_ids: List[str] = []


class RoadmapNode(BaseModel):
    id: str
    type: NodeType
    title: str
    description: str = ""
    phase_id: str
    priority: Priority = "medium"
    current_proficiency: Proficiency = "uncertain"
    target_proficiency: Proficiency = "intermediate"
    estimated_hours: float = Field(..., gt=0)
    start_week: int = Field(..., ge=1)
    end_week: int = Field(..., ge=1)
    status: NodeStatus = "not_started"
    prerequisites: List[str] = []
    skills: List[str] = []
    completion_criteria: List[str] = []
    verification_method: str = ""
    recommended_project: Optional[str] = None
    recommended_credentials: List[str] = []
    career_relevance: str = ""


class RoadmapEdge(BaseModel):
    id: str
    source: str
    target: str
    relationship: Relationship = "prerequisite"


class NextAction(BaseModel):
    node_id: str
    action: str


class RoadmapTarget(BaseModel):
    role: str
    company_type: str
    experience_level: str


class RoadmapResponse(BaseModel):
    target: RoadmapTarget
    student_profile: StudentProfile = StudentProfile()
    plan: RoadmapPlan
    phases: List[RoadmapPhase] = Field(..., min_length=1)
    nodes: List[RoadmapNode] = Field(..., min_length=1)
    edges: List[RoadmapEdge] = []
    next_actions: List[NextAction] = []


class ReplanRequest(BaseModel):
    roadmap: RoadmapResponse
    known_node_ids: List[str] = Field(..., min_length=1, max_length=100)
    hours_per_week: Optional[float] = Field(default=None, gt=0, le=80)
    timeline_months: Optional[int] = Field(default=None, gt=0, le=36)
