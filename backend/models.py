from pydantic import BaseModel, Field
from typing import Literal, Any, Optional
from datetime import datetime
import uuid

class TaskRequest(BaseModel):
    task: str = Field(..., min_length=3, max_length=2000)
    session_id: Optional[str] = None

class AgentEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal[
        "thought", "tool_call", "tool_result",
        "final_answer", "error", "status", "iteration"
    ]
    content: str
    tool_name: Optional[str] = None
    tool_input: Optional[Any] = None
    tool_output: Optional[Any] = None
    iteration: Optional[int] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: dict = Field(default_factory=dict)

class SessionHistory(BaseModel):
    session_id: str
    task: str
    events: list[AgentEvent] = []
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    status: Literal["running", "completed", "error"] = "running"