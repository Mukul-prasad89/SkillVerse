from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .schemas import (
    ProfileParseRequest, ProfileParseResponse,
    RoadmapGenerateRequest, NodeDetailRequest, ReplanRequest,
)
from . import ai_engine
from .roadmaps import build_roadmap
from .api.roadmap_controller import router as roadmap_router
from .api.replan_controller import replan_router
from .services.llm_service import provider_info

load_dotenv()

app = FastAPI(title="SkillVerse", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "engine": "fastapi+langchain"}


@app.get("/api/health")
def api_health():
    return {"status": "ok", "engine": "fastapi+langchain", "llm": provider_info()}


# AI Career Roadmapper pipeline (LangChain prompt -> LLM -> validated JSON)
app.include_router(roadmap_router)
app.include_router(replan_router)


@app.post("/api/profile/parse", response_model=ProfileParseResponse)
def profile_parse(req: ProfileParseRequest):
    """NL background → keywords/skills/projects/level. LLM via LangChain if key set, else rule-based."""
    result = ai_engine.parse_profile(req.goal, req.background_text)
    return result


@app.post("/api/roadmap/generate")
def roadmap_generate(req: RoadmapGenerateRequest):
    """Goal + background + limits → skill-tree JSON. Skips known skills, fits timeline."""
    return ai_engine.generate_roadmap(
        goal=req.goal,
        background_text=req.background_text or "",
        hours_per_week=req.hours_per_week,
        timeline_months=req.timeline_months,
        known_skills=req.known_skills,
        level=req.level or "Student",
    )


@app.post("/api/node/detail")
def node_detail(req: NodeDetailRequest):
    return ai_engine.node_detail(req.node_id, req.goal, req.label)


@app.post("/api/roadmap/replan")
def roadmap_replan(req: ReplanRequest):
    known = {s.lower() for s in req.known_skills}
    kept = [n for n in req.nodes
            if n.get("label", "").lower() not in known and n.get("id", "").lower() not in known]
    for i, n in enumerate(kept):
        n["depends_on"] = [] if i == 0 else [kept[i - 1]["id"]]
    edges = [{"from": kept[i]["id"], "to": n["id"]} for i, n in enumerate(kept) if i > 0] if kept else []
    return {"nodes": kept, "edges": edges, "skipped": len(req.nodes) - len(kept)}
