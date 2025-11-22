"""Authentication routes for the orchestrator API."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import create_access_token, get_password_hash, verify_password
from ..db import get_db
from ..models import User
from ..schemas import LoginRequest, TokenResponse, UserRegisterRequest
from ..services import orchestrator_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_and_login(
    payload: UserRegisterRequest,
    session: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Register a user and immediately return a token."""

    user = await orchestrator_service.register_user(
        session,
        payload,
        password_hash=get_password_hash(payload.password),
        is_staff=False,
    )
    token = create_access_token(user.id, user.is_staff)
    return TokenResponse(access_token=token)


async def _login_user(
    session: AsyncSession,
    payload: LoginRequest,
    *,
    require_staff: bool,
) -> TokenResponse:
    """Reusable login helper."""

    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad credentials")
    if require_staff and not user.is_staff:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff only")
    token = create_access_token(user.id, user.is_staff)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    session: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """User login endpoint."""

    return await _login_user(session, payload, require_staff=False)


@router.post("/staff/login", response_model=TokenResponse)
async def staff_login(
    payload: LoginRequest,
    session: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Staff-only login endpoint."""

    return await _login_user(session, payload, require_staff=True)

