import os
from pathlib import Path
from pydantic_settings import BaseSettings,SettingsConfigDict
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
class Settings(BaseSettings):
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")
    MONGODB_URL: str = os.getenv("MONGODB_URL")
    DATABASE_NAME: str = os.getenv("DB_NAME")
    INTERNAL_API_KEY:str=os.getenv("INTERNAL_API_KEY")
    model_config = SettingsConfigDict(
        env_file=ENV_PATH,
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()