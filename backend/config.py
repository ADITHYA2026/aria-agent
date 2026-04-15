from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    gemini_api_key: str
    tavily_api_key: str
    redis_url: str = "redis://localhost:6379"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"  # Changed to string
    max_iterations: int = 12
    model: str = "gemini-2.5-flash"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore extra environment variables

    def get_cors_origins(self) -> List[str]:
        """Convert comma-separated string to list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]

@lru_cache()
def get_settings():
    return Settings()

#"llama-3.1-8b-instant"
#"llama-3.3-70b-versatile"