"""DB 제약 위반 판정 유틸 — IntegrityError가 특정 제약 위반인지 확인한다.

asyncpg는 제약명을 보통 `orig.__cause__.constraint_name`에 싣지만 드라이버/버전에
따라 `orig.constraint_name`에 오기도 하고, 아예 없으면 예외 문자열에서 폴백 검색한다.
이 판정 로직이 여러 모듈(재테스트 EXCLUDE, 알림 dedup 등)에서 반복되던 것을 단일
정의로 모은다.
"""
from __future__ import annotations

from sqlalchemy.exc import IntegrityError


def is_constraint_violation(exc: IntegrityError, names: str | tuple[str, ...]) -> bool:
    """`exc`가 `names`(하나 또는 여럿) 중 하나의 제약 위반이면 True."""
    if isinstance(names, str):
        names = (names,)
    orig = getattr(exc, "orig", None)
    cause = getattr(orig, "__cause__", None)
    constraint_name = (
        getattr(orig, "constraint_name", None)
        or getattr(cause, "constraint_name", None)
        or ""
    )
    if constraint_name in names:
        return True
    exc_str = str(exc)
    return any(name in exc_str for name in names)
