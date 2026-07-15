# 파일명: users.py
from fastapi import APIRouter, Request, status

from app.core.deps import CurrentUser, DB
from app.schemas.parent_user import (
    ParentLoginDeviceOut,
    ParentPasswordUpdate,
    ParentUserOut,
    ParentUserUpdate,
)
from app.services import login_device_service, user_service

router = APIRouter()


# [GET /users/me]
@router.get("/me", response_model=ParentUserOut)
async def get_me(user: CurrentUser) -> ParentUserOut:
    return ParentUserOut.model_validate(user)


# [PATCH /users/me]
@router.patch("/me", response_model=ParentUserOut)
async def update_me(
    payload: ParentUserUpdate, user: CurrentUser, db: DB
) -> ParentUserOut:
    updated = await user_service.update_parent(db, user, payload)
    return ParentUserOut.model_validate(updated)


# [PATCH /users/me/password]
@router.patch("/me/password")
async def update_my_password(
    payload: ParentPasswordUpdate, user: CurrentUser, db: DB
) -> dict:
    await user_service.update_parent_password(
        db,
        user,
        current_password=payload.current_password,
        new_password=payload.new_password,
    )
    return {"success": True, "data": {"message": "비밀번호가 변경되었습니다."}}


# [GET /users/me/devices]
@router.get("/me/devices")
async def list_my_login_devices(
    request: Request, user: CurrentUser, db: DB
) -> dict:
    current_user_agent = (request.headers.get("user-agent") or "unknown").strip() or "unknown"
    devices = await login_device_service.list_login_devices(db, user.id)
    return {
        "success": True,
        "data": {
            "devices": [
                ParentLoginDeviceOut.model_validate(
                    {
                        "id": device.id,
                        "device_type": device.device_type,
                        "device_name": device.device_name,
                        "last_login_at": device.last_login_at,
                        "is_current": device.user_agent == current_user_agent,
                    }
                ).model_dump(mode="json")
                for device in devices
            ]
        },
    }


# [DELETE /users/me]
@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(user: CurrentUser, db: DB) -> None:
    await user_service.delete_parent(db, user)
