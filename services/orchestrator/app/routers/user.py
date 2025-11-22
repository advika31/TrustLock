"""User routes such as registration."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import get_password_hash
from ..db import get_db
from ..schemas import UserRegisterRequest, UserResponse
from ..services import orchestrator_service

router = APIRouter(prefix="/user", tags=["user"])


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserResponse,
)
async def register_user(
    payload: UserRegisterRequest,
    session: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Register an end user."""

    user = await orchestrator_service.register_user(
        session,
        payload,
        password_hash=get_password_hash(payload.password),
        is_staff=False,
    )
    return UserResponse(id=user.id, email=user.email)

