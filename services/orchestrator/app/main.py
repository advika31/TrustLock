"""FastAPI entrypoint for the orchestrator service."""

from __future__ import annotations

import logging

from fastapi import Depends, FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .db import get_db
from .routers import audit as audit_router
from .routers import auth as auth_router
from .routers import kyc as kyc_router
from .routers import review as review_router
from .routers import user as user_router
from .schemas import HealthResponse

try:
    from redis import asyncio as redis_asyncio
except ImportError:  # pragma: no cover
    redis_asyncio = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TrustLock Orchestrator",
    version="1.0.0",
    description="KYC orchestration service",
)

redis_client = None


@app.on_event("startup")
async def startup_event() -> None:
    """Initialize application state."""

    global redis_client
    if redis_asyncio:
        redis_client = redis_asyncio.from_url(settings.redis_url)
    logger.info("Orchestrator service starting with host %s", settings.orchestrator_host)


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Clean up resources."""

    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None


@app.get("/health", response_model=HealthResponse, tags=["meta"])
async def health_check(session: AsyncSession = Depends(get_db)) -> HealthResponse:
    """Simple health probe."""

    try:
        await session.execute("SELECT 1")
        db_status = "ok"
    except Exception as exc:  # pragma: no cover
        logger.exception("DB health check failed: %s", exc)
        db_status = "error"

    redis_status = "ok"
    if redis_client:
        try:
            await redis_client.ping()
        except Exception as exc:  # pragma: no cover
            logger.exception("Redis health check failed: %s", exc)
            redis_status = "error"
    else:
        redis_status = "disabled"

    return HealthResponse(db=db_status, redis=redis_status)


app.include_router(user_router.router)
app.include_router(auth_router.router)
app.include_router(kyc_router.router)
app.include_router(review_router.router)
app.include_router(audit_router.router)

