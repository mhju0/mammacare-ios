import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.deps import CurrentUser

router = APIRouter()
logger = logging.getLogger("mammacare")

_UPLOAD_ROOT = Path(settings.UPLOAD_DIR).resolve()


@router.get("/{blob_path:path}")
async def serve_media(blob_path: str, user: CurrentUser) -> FileResponse:
    """로컬에 저장된 업로드 이미지를 로그인 사용자에게 서빙.

    아기 사진/증상 사진은 PII이므로 CurrentUser 의존으로 인증을 강제한다.

    보안 주의: 리소스별 소유권(IDOR) 검사는 의도적으로 생략한다. 로그인한
    사용자라면 blob_path를 아는 한 타인의 PII 사진도 조회 가능하다는 위험을
    부트캠프/데모 범위에서 수용한 결정이다(소유권 검증 미도입). 운영 전환 시에는
    blob_path → 소유 아기 역추적 후 verify_baby_owner로 검증할 것.
    """
    target = (_UPLOAD_ROOT / blob_path).resolve()
    if target != _UPLOAD_ROOT and _UPLOAD_ROOT not in target.parents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="잘못된 파일 경로입니다.",
        )
    if not target.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="파일을 찾을 수 없습니다.",
        )
    return FileResponse(target)
