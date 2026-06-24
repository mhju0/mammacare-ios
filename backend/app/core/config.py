from functools import lru_cache
from pathlib import Path
from urllib.parse import unquote

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_ROOT = Path(__file__).resolve().parents[2]
_ENV_FILE = _BACKEND_ROOT / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = "맘마케어"
    APP_ENV: str = "development"
    DEBUG: bool = False
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    DATABASE_URL: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    ALLOWED_ORIGINS: str = ""

    FRONTEND_URL: str = "http://localhost:5173"
    FRONTEND_OAUTH_CALLBACK_PATH: str = "/auth/callback"

    # 로컬 파일 저장 (구 Azure Blob 대체)
    # UPLOAD_DIR: 업로드 이미지를 저장할 디렉토리. 미설정 시 backend/uploads.
    # MEDIA_BASE_URL: 저장 이미지를 서빙하는 보호 엔드포인트 prefix.
    UPLOAD_DIR: str = str(_BACKEND_ROOT / "uploads")
    MEDIA_BASE_URL: str = "/api/media"

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = ""

    KAKAO_CLIENT_ID: str = ""
    KAKAO_CLIENT_SECRET: str = ""
    KAKAO_REDIRECT_URI: str = ""
    KAKAO_MAP_REST_API_KEY: str = ""

    NAVER_CLIENT_ID: str = ""
    NAVER_CLIENT_SECRET: str = ""
    NAVER_REDIRECT_URI: str = ""

    FIREBASE_CREDENTIALS_PATH: str = ""

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug_mode(cls, value: object) -> object:
        if isinstance(value, str):
            mode = value.strip().lower()
            if mode in {"release", "production"}:
                return False
            if mode in {"debug", "development"}:
                return True
        return value

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    @property
    def db_url_decoded(self) -> str:
        return unquote(self.DATABASE_URL)

    @property
    def allowed_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
