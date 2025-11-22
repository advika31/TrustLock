"""Shared pytest fixtures."""

from __future__ import annotations

import os
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./orchestrator_test.db")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("USE_STUBS", "true")

from app.main import app  # noqa: E402
from app.db import get_db  # noqa: E402
from app.models import Base  # noqa: E402

engine = create_async_engine(os.environ["DATABASE_URL"], future=True)
TestingSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db() -> None:
    """Create database schema."""

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def _override_get_db():
    async with TestingSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = _override_get_db


@pytest_asyncio.fixture
async def client() -> AsyncClient:
    """Return HTTP client bound to FastAPI app."""

    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c


@pytest_asyncio.fixture
async def db_session() -> AsyncSession:
    """Direct access to the test database session."""

    async with TestingSessionLocal() as session:
        yield session

