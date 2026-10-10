
import logging

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from ..orchestration.roadmap_workflow import (
    LLMFailure,
    RoadmapValidationError,
    generate_roadmap,
)
from ..schemas.roadmap import RoadmapRequest, RoadmapResponse
from ..services.llm_service import LLMConfigError

log = logging.getLogger("roadmap_controller")

router = APIRouter()


@router.post("/api/roadmaps/generate", response_model=RoadmapResponse)
def roadmaps_generate(request: RoadmapRequest):
    """Generate a personalized, AI-driven career roadmap from student input."""
    try:
        return generate_roadmap(request)
    except LLMConfigError as e:
        log.warning("LLM not configured: %s", e)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"detail": str(e)},
        )
    except (LLMFailure, RoadmapValidationError) as e:
        log.warning("Roadmap generation failed: %s", e)
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={"detail": str(e)},
        )
    except ValidationError as e:  # pragma: no cover - FastAPI maps these to 422 first
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": e.errors()},
        )
    except Exception as e:  # never leak stack traces to the client
        log.exception("Unexpected roadmap error")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Unexpected error while generating the roadmap."},
        )
