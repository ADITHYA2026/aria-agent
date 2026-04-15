import asyncio
import json
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from models import TaskRequest, AgentEvent
from agent import run_agent
from memory import memory
from config import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("ARIA Agent API starting up...")
    yield
    print("ARIA Agent API shutting down...")


app = FastAPI(
    title="ARIA Agent API",
    description="Autonomous Research & Intelligence Agent",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def event_stream(task: str, session_id: str):
    """Generate SSE stream of agent events."""
    try:
        async for event in run_agent(task, session_id):
            await memory.append_event(session_id, event)
            data = event.model_dump_json()
            yield f"data: {data}\n\n"
            await asyncio.sleep(0)

        await memory.mark_complete(session_id, "completed")
        yield f"data: {json.dumps({'type': 'done', 'session_id': session_id})}\n\n"

    except asyncio.CancelledError:
        await memory.mark_complete(session_id, "error")
        yield f"data: {json.dumps({'type': 'error', 'content': 'Stream cancelled'})}\n\n"
    except Exception as e:
        await memory.mark_complete(session_id, "error")
        yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"


@app.post("/api/run")
async def run_task(request: TaskRequest):
    """Start an agent task and return session ID."""
    session_id = request.session_id or str(uuid.uuid4())
    await memory.create_session(request.task)
    return {"session_id": session_id, "status": "started"}


@app.get("/api/stream/{session_id}")
async def stream_task(
    session_id: str, 
    task: str = Query(..., description="The task to execute")  # ← FIX: proper query param
):
    """SSE endpoint — streams agent events in real time."""
    return StreamingResponse(
        event_stream(task, session_id),  # ← Now task is properly passed
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/session/{session_id}")
async def get_session(session_id: str):
    session = await memory.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@app.get("/api/health")
async def health():
    return {"status": "ok", "agent": "ARIA", "version": "1.0.0"}