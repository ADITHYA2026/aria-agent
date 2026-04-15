import json
import redis.asyncio as aioredis
from models import AgentEvent, SessionHistory
from config import get_settings
import uuid

settings = get_settings()

class MemoryManager:
    def __init__(self):
        self._redis = None
        self._redis_available = None

    async def get_redis(self):
        if self._redis_available is False:
            return None
            
        if self._redis is None:
            try:
                self._redis = aioredis.from_url(
                    settings.redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_timeout=2,
                )
                await self._redis.ping()
                self._redis_available = True
                print("✅ Redis connected successfully")
            except Exception as e:
                self._redis_available = False
                print(f"⚠️ Redis not available: {str(e)}")
                print("   Session persistence disabled (app will still work)")
                self._redis = None
        return self._redis if self._redis_available else None

    async def create_session(self, task: str) -> str:
        session_id = str(uuid.uuid4())
        session = SessionHistory(session_id=session_id, task=task)
        r = await self.get_redis()
        if r:
            try:
                await r.setex(f"session:{session_id}", 3600, session.model_dump_json())
            except Exception as e:
                print(f"Redis error in create_session: {e}")
        return session_id

    async def append_event(self, session_id: str, event: AgentEvent):
        r = await self.get_redis()
        if not r:
            return
        try:
            raw = await r.get(f"session:{session_id}")
            if raw:
                session = SessionHistory.model_validate_json(raw)
                session.events.append(event)
                await r.setex(f"session:{session_id}", 3600, session.model_dump_json())
        except Exception as e:
            print(f"Redis error in append_event: {e}")

    async def get_session(self, session_id: str) -> SessionHistory | None:
        r = await self.get_redis()
        if not r:
            return None
        try:
            raw = await r.get(f"session:{session_id}")
            if raw:
                return SessionHistory.model_validate_json(raw)
        except Exception as e:
            print(f"Redis error in get_session: {e}")
        return None

    async def mark_complete(self, session_id: str, status: str = "completed"):
        r = await self.get_redis()
        if not r:
            return
        try:
            raw = await r.get(f"session:{session_id}")
            if raw:
                session = SessionHistory.model_validate_json(raw)
                session.status = status
                await r.setex(f"session:{session_id}", 7200, session.model_dump_json())
        except Exception as e:
            print(f"Redis error in mark_complete: {e}")

memory = MemoryManager()