from pydantic_settings import BaseSettings
from functools import lru_cache
import json
import base64


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_NAME: str = "Biblia Question API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Firebase
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_CREDENTIALS_PATH: str | None = None
    FIREBASE_CREDENTIALS_BASE64: str | None = None

    # CORS
    CORS_ORIGINS: str = "http://localhost:4200"

    # API
    API_PREFIX: str = "/api/v1"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    def get_firebase_credentials(self) -> dict | None:
        """Get Firebase credentials from base64 or file path."""
        if self.FIREBASE_CREDENTIALS_BASE64:
            try:
                decoded = base64.b64decode(self.FIREBASE_CREDENTIALS_BASE64)
                return json.loads(decoded)
            except Exception:
                return None
        return None


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
