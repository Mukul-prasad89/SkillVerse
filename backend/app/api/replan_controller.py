"""Replan controller: revised roadmap after the user masters nodes.

Never calls the LLM directly. Never builds a hardcoded roadmap.
"""
import logging

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from ..orchestration.replan_workflow import replan_roadmap
from ..orchestration.roadmap_workflow import LLMFailure, RoadmapValidationError
from ..schemas.roadmap import ReplanRequest, RoadmapResponse
from ..services.llm_service import LLMConfigError

log = logging.getLogger("replan_controller")

replan_router = APIRouter()


@replan_router.post("/api/roadmaps/replan", response_model=RoadmapResponse)
def roadmaps_replan(request: ReplanRequest):
    """Regenerate the roadmap with mastered nodes removed and rewired by the AI."""
    try:
        return replan_roadmap(request)
    except LLMConfigError as e:
        log.warning("LLM not configured: %s", e)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"detail": str(e)},
        )
    except (LLMFailure, RoadmapValidationError) as e:
        log.warning("Replan failed: %s", e)
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={"detail": str(e)},
        )
    except Exception:
        log.exception("Unexpected replan error")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Unexpected error while replanning the roadmap."},
        )
