# Allergy report routes are mounted under /api/babies by app.api.router.

import uuid
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.crud.allergy import report as crud
from app.crud.allergy.ownership import verify_baby_owner
from app.services.allergy import report as service

from app.core.deps import CurrentUser
from app.core.storage import read_image_as_data_uri

router = APIRouter()
logger = logging.getLogger("mammacare")


@router.get(
    "/{baby_id}/report",
    summary="아기 알레르기 리포트 다운로드 (pdf / jpeg)",
    response_class=Response,
)
async def download_report(
    baby_id: uuid.UUID,
    current_user: CurrentUser,
    days: int = Query(default=7, ge=1, le=90),
    format: str = Query(default="pdf", pattern="^(pdf|jpeg)$"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """최근 N일 내 테스팅·증상·사진을 PDF 또는 JPEG로 반환"""

    await verify_baby_owner(db, baby_id, current_user.id)

    _KST = timezone(timedelta(hours=9))
    period_to = datetime.now(_KST)
    period_from = period_to - timedelta(days=days)

    # 1) DB 조회
    baby, testings, confirmed_allergies = await crud.get_baby_report(db, baby_id, days)
    if not baby:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="아기 정보를 찾을 수 없습니다.",
        )

    # 2) 사진을 data URI로 사전 임베드
    # weasyprint는 인증 헤더를 못 보내 보호 엔드포인트를 직접 못 읽으므로,
    # 리포트 렌더 경로에서는 로컬 파일을 base64 data URI로 인라인 임베드한다.
    photo_sas_map: dict[str, str] = {}
    for testing in testings:
        for check in testing.symptom_checks:
            for photo in check.symptom_photos:
                if photo.photo_url and photo.photo_url not in photo_sas_map:
                    data_uri = await read_image_as_data_uri(photo.photo_url)
                    if data_uri:
                        photo_sas_map[photo.photo_url] = data_uri

    # 3) 스키마 조립
    report = service.build_report(
        baby, testings, confirmed_allergies, period_from, period_to,
        photo_sas_map=photo_sas_map,
    )

    # 4) 포맷별 생성 및 반환
    if format == "jpeg":
        img_bytes = await service.generate_jpeg_async(report)
        logger.info("리포트 JPEG 생성 완료 — baby_id=%s", baby_id)
        return Response(
            content=img_bytes,
            media_type="image/jpeg",
            headers={
                "Content-Disposition": f"attachment; filename=report_{baby_id}.jpg"
            },
        )

    pdf_bytes = await service.generate_pdf_async(report)
    logger.info("리포트 PDF 생성 완료 — baby_id=%s", baby_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=report_{baby_id}.pdf"
        },
    )
