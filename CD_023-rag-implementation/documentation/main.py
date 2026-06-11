import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

app = FastAPI(title="Documentation Service", docs_url="/api-docs", redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DOCS_DIR = Path(os.getenv("DOCS_DIR", "/docs"))


@app.get("/docs")
def list_docs():
    files = [f.name for f in DOCS_DIR.glob("*.md") if f.is_file()]
    return {"files": sorted(files)}


@app.get("/docs/{filename}")
def get_doc(filename: str):
    if ".." in filename or "/" in filename:
        raise HTTPException(status_code=404, detail=f"File not found: {filename}")

    path = DOCS_DIR / filename
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail=f"File not found: {filename}")

    return PlainTextResponse(path.read_text(encoding="utf-8"))
