from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./sentinel.db"
    SECRET_KEY: str = "super_secret_jwt_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REDIS_URL: str = "redis://localhost:6379/0"
    GEMINI_API_KEY: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()
