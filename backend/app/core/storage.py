import asyncio
import base64
import logging
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger("mammacare")

_ALLOWED_EXT: dict[str, str] = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}

# 확장자 → MIME (리포트 임베드 시 data URI 헤더용)
_EXT_TO_MIME: dict[str, str] = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
}

_UPLOAD_ROOT = Path(settings.UPLOAD_DIR)


def is_blob_path(value: str | None) -> bool:
    """data URL(레거시)·외부 URL이 아닌 로컬 저장 경로(상대경로)인지 판별."""
    return bool(value) and not value.startswith(("data:", "http://", "https://"))


def _resolve_path(blob_path: str) -> Path:
    """blob_path를 업로드 루트 하위의 안전한 절대 경로로 변환 (경로 탈출 차단)."""
    root = _UPLOAD_ROOT.resolve()
    target = (root / blob_path).resolve()
    if target != root and root not in target.parents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="잘못된 파일 경로입니다.",
        )
    return target


async def upload_image_to_blob(
    file: UploadFile,
    folder: str = "symptoms",
    max_size_bytes: int = 5 * 1024 * 1024,
) -> str:
    """이미지를 로컬 디스크(UPLOAD_DIR/{folder}/{uuid}.ext)에 저장하고 상대경로 반환 (URL 아님)"""

    if file.content_type not in _ALLOWED_EXT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미지 파일만 업로드 가능합니다. (jpeg, png, webp)",
        )

    contents = await file.read()

    if len(contents) > max_size_bytes:
        max_size_mb = max_size_bytes // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"파일 크기는 {max_size_mb}MB 이하만 가능합니다.",
        )

    ext = _ALLOWED_EXT[file.content_type]
    blob_path = f"{folder}/{uuid.uuid4()}.{ext}"
    dest = _resolve_path(blob_path)

    def _write() -> None:
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(contents)

    await asyncio.get_running_loop().run_in_executor(None, _write)
    return blob_path


async def generate_sas_url(blob_path: str, expires_minutes: int = 15) -> str:
    """저장 이미지를 서빙하는 보호 엔드포인트 URL 반환.

    구 Azure SAS URL을 대체. expires_minutes는 호출부 호환을 위해 유지하나
    로컬 서빙에서는 사용하지 않는다.
    """
    return f"{settings.MEDIA_BASE_URL}/{blob_path}"


async def read_image_as_data_uri(blob_path: str) -> str | None:
    """리포트(weasyprint) 임베드용 base64 data URI 반환.

    weasyprint는 인증 헤더를 보낼 수 없어 보호 엔드포인트를 직접 못 읽으므로,
    리포트 렌더 경로에서는 이미지를 data URI로 인라인 임베드한다.
    파일이 없으면 None (리포트에서 해당 사진만 생략).
    """

    def _read() -> str | None:
        try:
            path = _resolve_path(blob_path)
            data = path.read_bytes()
        except (FileNotFoundError, HTTPException):
            return None
        mime = _EXT_TO_MIME.get(path.suffix.lstrip(".").lower(), "image/jpeg")
        b64 = base64.b64encode(data).decode("ascii")
        return f"data:{mime};base64,{b64}"

    return await asyncio.get_running_loop().run_in_executor(None, _read)


async def delete_image_from_blob(blob_path: str) -> None:
    """로컬 디스크에서 이미지 삭제 (예외는 흡수)."""

    def _delete() -> None:
        try:
            _resolve_path(blob_path).unlink()
        except FileNotFoundError:
            pass

    try:
        await asyncio.get_running_loop().run_in_executor(None, _delete)
    except Exception:
        pass
