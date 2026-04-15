import asyncio
import json
from typing import AsyncGenerator
from google import genai
from google.genai import types
from models import AgentEvent
from tools import dispatch_tool
from config import get_settings

settings = get_settings()

# Initialize Gemini client
client = genai.Client(api_key=settings.gemini_api_key)

SYSTEM_PROMPT = """You are ARIA — Autonomous Research & Intelligence Agent.

You have access to these tools:
- web_search: Search the internet. Use: {"query": "search term", "max_results": 5}
- execute_code: Run Python code. Use: {"code": "python code", "language": "python"}
- fetch_webpage: Read a webpage. Use: {"url": "https://..."}
- calculate: Math expressions. Use: {"expression": "2+2"}
- read_file: Read a file. Use: {"path": "./file.txt"}
- write_file: Write to a file. Use: {"path": "./file.txt", "content": "data"}

IMPORTANT: To use a tool, respond with:
TOOL: tool_name
ARGS: {"param": "value"}

Always provide a final answer."""


def parse_tool_call(text: str) -> tuple[str, dict] | None:
    """Parse tool calls from Gemini response."""
    import re
    
    # Pattern: TOOL: name\nARGS: {...}
    match = re.search(r'TOOL:\s*(\w+)\s*ARGS:\s*({.*?})', text, re.DOTALL | re.IGNORECASE)
    if match:
        tool_name = match.group(1).lower()
        try:
            args = json.loads(match.group(2))
            return (tool_name, args)
        except:
            pass
    return None


async def run_agent(
    task: str,
    session_id: str,
) -> AsyncGenerator[AgentEvent, None]:
    
    # Store conversation history
    messages = []
    iteration = 0

    yield AgentEvent(
        type="status",
        content="Agent initialized with Gemini. Analyzing task...",
        metadata={"session_id": session_id},
    )

    while iteration < settings.max_iterations:
        iteration += 1

        yield AgentEvent(
            type="iteration",
            content=f"Iteration {iteration}",
            iteration=iteration,
        )

        try:
            # Build message history
            if not messages:
                # First message with system prompt
                response = await asyncio.to_thread(
                    client.models.generate_content,
                    model=settings.model,
                    contents=f"{SYSTEM_PROMPT}\n\nUser: {task}",
                    config=types.GenerateContentConfig(
                        temperature=0.3,
                        max_output_tokens=4096,
                    )
                )
            else:
                # Continue conversation
                conversation = "\n".join(messages)
                response = await asyncio.to_thread(
                    client.models.generate_content,
                    model=settings.model,
                    contents=f"{SYSTEM_PROMPT}\n\n{conversation}\n\nAssistant: ",
                    config=types.GenerateContentConfig(
                        temperature=0.3,
                        max_output_tokens=4096,
                    )
                )
            
            content = response.text
            
        except Exception as e:
            error_msg = f"Gemini API error: {str(e)}"
            print(error_msg)
            yield AgentEvent(type="error", content=error_msg)
            return

        # Emit thought
        if content.strip():
            yield AgentEvent(type="thought", content=content.strip())

        # Check for tool calls
        tool_call = parse_tool_call(content)
        
        if tool_call:
            tool_name, tool_input = tool_call
            
            yield AgentEvent(
                type="tool_call",
                content=f"Calling {tool_name}",
                tool_name=tool_name,
                tool_input=tool_input,
            )

            try:
                result = await dispatch_tool(tool_name, tool_input)
            except Exception as e:
                result = {"error": str(e)}

            result_str = json.dumps(result, ensure_ascii=False, indent=2)

            yield AgentEvent(
                type="tool_result",
                content=result_str[:2000],
                tool_name=tool_name,
                tool_output=result,
            )

            # Store conversation
            messages.append(f"User: {task if iteration == 1 else 'Continue'}")
            messages.append(f"Assistant: {content}")
            messages.append(f"Tool Result: {result_str}")
            continue
        
        # No tool call - final answer
        yield AgentEvent(type="final_answer", content=content)
        return

    yield AgentEvent(
        type="final_answer",
        content="Reached maximum iterations. Here is what I found.",
    )