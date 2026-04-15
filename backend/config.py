from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    gemini_api_key: str
    tavily_api_key: str
    redis_url: str = "redis://localhost:6379"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    max_iterations: int = 12
    model: str = "gemini-2.5-flash"
    #"llama-3.1-8b-instant"
    #"llama-3.3-70b-versatile"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings():
    return Settings()