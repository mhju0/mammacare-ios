import uuid

from fastapi import APIRouter

from app.core.deps import CurrentAdmin, DB
from app.core.response import ApiResponse
from app.services import admin_service

router = APIRouter()


@router.post("/security/grant-admin/{parent_id}", response_model=ApiResponse)
async def grant_admin(
    parent_id: uuid.UUID,
    current_admin: CurrentAdmin,
    db: DB,
):
    data = await admin_service.grant_admin(db, parent_id, current_admin.id)
    return ApiResponse(success=True, message=data.message, data=data.model_dump())


@router.post("/security/revoke-admin/{parent_id}", response_model=ApiResponse)
async def revoke_admin(
    parent_id: uuid.UUID,
    current_admin: CurrentAdmin,
    db: DB,
):
    data = await admin_service.revoke_admin(db, parent_id, current_admin.id)
    return ApiResponse(success=True, message=data.message, data=data.model_dump())
