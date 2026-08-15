from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    APP_NAME: str = "BioStor"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Database — PostgreSQL in production. SQLite (aiosqlite) is used for local dev
    # by default so the platform runs out of the box. Set DATABASE_URL to a
    # `postgresql+asyncpg://...` URL in production.
    DATABASE_URL: str = "sqlite+aiosqlite:///./biostore.db"

    # JWT
    SECRET_KEY: str = "biostor-change-me-in-production-0000000000000000000000"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Password
    BCRYPT_ROUNDS: int = 12

    # Email (leave unset to log emails to console in dev)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: str = "noreply@biostor.app"
    EMAIL_FROM_NAME: str = "BioStor"

    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"
    PUBLIC_BASE_URL: str = "http://localhost:3000"

    # Uploads — local disk storage by default. Swap in S3/Supabase by setting
    # STORAGE_PROVIDER=supabase plus the credentials below.
    STORAGE_PROVIDER: str = "local"
    UPLOAD_DIR: str = "./uploads"
    UPLOAD_MAX_SIZE_MB: int = 10
    MAX_IMAGES_PER_OBJECT: int = 6
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_BUCKET: str = "biostor"
    S3_BUCKET: Optional[str] = None
    S3_REGION: Optional[str] = None
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None

    # Rate limiting (requests per window per client IP)
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 240
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    AUTH_RATE_LIMIT_REQUESTS: int = 10
    AUTH_RATE_LIMIT_WINDOW_MINUTES: int = 15

    # Seeding
    SEED_DEMO_DATA: bool = True
    ADMIN_EMAIL: str = "admin@biostor.app"
    ADMIN_PASSWORD: str = "Admin@12345"

    # CORS — pydantic-settings JSON-decodes list fields, so the env var must be
    # a JSON array (e.g. ["https://frontend.example.com"]).
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        return v

    class Config:
        case_sensitive = True
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
