import httpx
import subprocess
import sys
import tempfile
import os
import re
from typing import Any
from ddgs import DDGS
from config import get_settings

settings = get_settings()

async def web_search(query: str, max_results: int = 5) -> dict:
    """Search the web using Tavily API."""
    try:
        import requests

        response = requests.post(
            "https://api.tavily.com/search",
            json={
                "api_key": settings.tavily_api_key,
                "query": query,
                "search_depth": "basic",
                "max_results": max_results,
                "include_answer": True,
            },
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        response.raise_for_status()

        data = response.json()
        results = []

        for r in data.get("results", []):
            results.append({
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "content": r.get("content", "")[:800],
                "score": r.get("score", 0),
            })

        return {
            "answer": data.get("answer", ""),
            "results": results,
            "query": query,
        }

    except Exception as e:
        return {"error": str(e), "query": query, "results": []}


async def execute_code(code: str, language: str = "python") -> dict:
    """Execute Python code in a local subprocess sandbox."""
    if language != "python":
        return {"error": "Only Python is supported in local mode."}
    
    # Enhanced safety filter
    dangerous = [
        "os.system", "subprocess", "shutil.rmtree", "__import__('os')", 
        "eval(", "exec(", "__builtins__", "globals()", "locals()",
        "open(", "__import__", "compile(", "breakpoint()"
    ]
    for d in dangerous:
        if d in code:
            return {"error": f"Blocked: '{d}' is not allowed in sandboxed execution."}

    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write(code)
            tmpfile = f.name

        result = subprocess.run(
            [sys.executable, tmpfile],
            capture_output=True,
            text=True,
            timeout=20,
        )
        os.unlink(tmpfile)
        return {
            "stdout": result.stdout[:3000],
            "stderr": result.stderr[:1000],
            "returncode": result.returncode,
            "success": result.returncode == 0,
        }
    except subprocess.TimeoutExpired:
        return {"error": "Code execution timed out (20s limit)."}
    except Exception as e:
        return {"error": str(e)}

async def fetch_webpage(url: str) -> dict:
    """Fetch and extract readable text content from a URL."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            text = response.text
            # Strip HTML tags
            clean = re.sub(r"<[^>]+>", " ", text)
            clean = re.sub(r"\s+", " ", clean).strip()
            return {
                "url": url,
                "content": clean[:5000],
                "status_code": response.status_code,
            }
    except Exception as e:
        return {"error": str(e), "url": url}

async def calculate(expression: str) -> dict:
    """Evaluate a mathematical expression safely."""
    import math
    allowed_names = {k: v for k, v in math.__dict__.items() if not k.startswith("_")}
    allowed_names.update({"abs": abs, "round": round, "min": min, "max": max, "sum": sum})
    try:
        result = eval(expression, {"__builtins__": {}}, allowed_names)
        return {"expression": expression, "result": result}
    except Exception as e:
        return {"error": str(e), "expression": expression}

async def read_file(path: str) -> dict:
    """Read a file from the filesystem (restricted to current directory)."""
    try:
        # Security: prevent directory traversal
        abs_path = os.path.abspath(path)
        if not abs_path.startswith(os.getcwd()):
            return {"error": "Access denied: cannot read outside current directory"}
        
        with open(abs_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"path": path, "content": content[:5000], "size": len(content)}
    except Exception as e:
        return {"error": str(e), "path": path}

async def write_file(path: str, content: str) -> dict:
    """Write content to a file (restricted to current directory)."""
    try:
        abs_path = os.path.abspath(path)
        if not abs_path.startswith(os.getcwd()):
            return {"error": "Access denied: cannot write outside current directory"}
        
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(content)
        return {"path": path, "success": True, "bytes_written": len(content)}
    except Exception as e:
        return {"error": str(e), "path": path}

# Tool registry
TOOLS = {
    "web_search": {
        "fn": web_search,
        "description": "Search the web for current information, news, facts, and research. Use this for any real-time or recent information.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "max_results": {"type": "integer", "description": "Max results (1-10)", "default": 5},
            },
            "required": ["query"],
        },
    },
    "execute_code": {
        "fn": execute_code,
        "description": "Write and execute Python code. Use for calculations, data processing, algorithms, and scripts.",
        "parameters": {
            "type": "object",
            "properties": {
                "code": {"type": "string", "description": "Python code to execute"},
                "language": {"type": "string", "default": "python"},
            },
            "required": ["code"],
        },
    },
    "fetch_webpage": {
        "fn": fetch_webpage,
        "description": "Fetch and read the full text content of any webpage by URL.",
        "parameters": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "Full URL to fetch"},
            },
            "required": ["url"],
        },
    },
    "calculate": {
        "fn": calculate,
        "description": "Evaluate mathematical expressions. Supports Python math functions.",
        "parameters": {
            "type": "object",
            "properties": {
                "expression": {"type": "string", "description": "Math expression to evaluate"},
            },
            "required": ["expression"],
        },
    },
    "read_file": {
        "fn": read_file,
        "description": "Read content from a local file by path.",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path to read"},
            },
            "required": ["path"],
        },
    },
    "write_file": {
        "fn": write_file,
        "description": "Write text content to a local file.",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path to write"},
                "content": {"type": "string", "description": "Content to write"},
            },
            "required": ["path", "content"],
        },
    },
}

def get_tool_schemas() -> list[dict]:
    return [
        {
            "name": name,
            "description": info["description"],
            "input_schema": {
                "type": "object",
                "properties": info["parameters"]["properties"],
                "required": info["parameters"].get("required", []),
            },
        }
        for name, info in TOOLS.items()
    ]


async def dispatch_tool(name: str, inputs: dict) -> Any:
    if name not in TOOLS:
        return {"error": f"Unknown tool: {name}"}
    fn = TOOLS[name]["fn"]
    return await fn(**inputs)