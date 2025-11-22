"""Database session and engine utilities."""

from __future__ import annotations

import logging
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from .config import settings

logger = logging.getLogger(__name__)


def get_engine() -> AsyncEngine:
    """Create a new SQLAlchemy async engine."""

    engine = create_async_engine(
        settings.database_url,
        pool_pre_ping=True,
        echo=False,
        future=True,
    )
    logger.info("Async engine created for %s", settings.database_url)
    return engine


engine: AsyncEngine = get_engine()
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a database session."""

    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

