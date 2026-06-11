import hashlib
import os
import re

import psycopg2
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI(title="Vectorizer Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DOCS_SERVICE_URL = os.getenv("DOCS_SERVICE_URL", "http://documentation:8001")
DATABASE_URL = os.getenv("DATABASE_URL")

model = SentenceTransformer("all-MiniLM-L6-v2")


class VectorizeRequest(BaseModel):
    filename: str


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")

# Markdown files start with a --- block of metadata (title, category). 
# This strips that block out and returns it separately from the actual body content.
def parse_frontmatter(raw: str) -> tuple[dict, str]:
    if not raw.startswith("---"):
        return {}, raw

    end = raw.find("---", 3)
    if end == -1:
        return {}, raw

    frontmatter_block = raw[3:end].strip()
    body = raw[end + 3:].strip()

    meta = {}
    for line in frontmatter_block.splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()

    return meta, body


# Splits the markdown body on every ## Heading boundary. 
# Returns a list of (heading, content) pairs — one chunk per H2 section.
def chunk_by_h2(body: str) -> list[tuple[str, str]]:
    """Split markdown body into (heading, content) pairs on H2 boundaries."""
    chunks = []
    current_heading = None
    current_lines = []

    for line in body.splitlines():
        if line.startswith("## "):
            if current_heading is not None:
                chunks.append((current_heading, "\n".join(current_lines).strip()))
            current_heading = line[3:].strip()
            current_lines = []
        else:
            if current_heading is not None:
                current_lines.append(line)

    if current_heading is not None:
        chunks.append((current_heading, "\n".join(current_lines).strip()))

    return chunks


# MAIN Ingestion Flow
# Fetches the markdown file from the documentation service
# Parses frontmatter → extracts title + category
# Chunks the body by H2 headings
# For each chunk: checks if it already exists in DB with the same SHA-256 hash → skips if unchanged, otherwise embeds it and upserts
# Deletes any DB rows for sections that no longer exist in the document (handles deletions/renames)
@app.post("/vectorize")
def vectorize(req: VectorizeRequest):
    filename = req.filename

    # Step 1 — Fetch file from documentation service
    resp = requests.get(f"{DOCS_SERVICE_URL}/docs/{filename}", timeout=30)
    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail=f"File not found: {filename}")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Some error occurred while fetching the documentation")

    raw = resp.text

    # Step 2 — Parse frontmatter
    meta, body = parse_frontmatter(raw)
    title = meta.get("title", filename)
    category = meta.get("category", "General")

    # Step 3 — Structural chunking by H2
    raw_chunks = chunk_by_h2(body)
    if not raw_chunks:
        raise HTTPException(status_code=422, detail="No H2 sections found in document")

    chunks = []
    for heading, chunk_body in raw_chunks:
        section_id = slugify(heading)
        content = f"[{title} | {category} | {heading}]\n\n{chunk_body}"
        section_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
        chunks.append({
            "heading": heading,
            "section_id": section_id,
            "body": chunk_body,
            "content": content,
            "section_hash": section_hash,
        })

    # Step 4 & 5 — Upsert and clean up
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        chunks_processed = 0

        for chunk in chunks:
            cur.execute(
                "SELECT section_hash FROM documents WHERE source=%s AND section_id=%s",
                (filename, chunk["section_id"]),
            )
            row = cur.fetchone()

            if row and row[0] == chunk["section_hash"]:
                continue  # unchanged — skip embedding

            embedding = model.encode(chunk["content"]).tolist()
            cur.execute(
                """
                INSERT INTO documents (source, section_id, section_hash, content, embedding, last_modified)
                VALUES (%s, %s, %s, %s, %s, NOW())
                ON CONFLICT (source, section_id)
                DO UPDATE SET section_hash  = EXCLUDED.section_hash,
                              content       = EXCLUDED.content,
                              embedding     = EXCLUDED.embedding,
                              last_modified = NOW()
                """,
                (
                    filename,
                    chunk["section_id"],
                    chunk["section_hash"],
                    chunk["content"],
                    embedding,
                ),
            )
            chunks_processed += 1

        # Delete sections that no longer exist in the document
        current_section_ids = [c["section_id"] for c in chunks]
        cur.execute(
            "DELETE FROM documents WHERE source=%s AND section_id != ALL(%s)",
            (filename, current_section_ids),
        )

        conn.commit()
        cur.close()
    finally:
        conn.close()

    return {"status": "success", "filename": filename, "chunks_processed": chunks_processed}


@app.get("/metadata")
def get_metadata():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT source, section_id, section_hash, last_modified FROM documents ORDER BY source, section_id"
        )
        rows = cur.fetchall()
        cur.close()
    finally:
        conn.close()

    grouped: dict[str, list[dict]] = {}
    for source, section_id, section_hash, last_modified in rows:
        grouped.setdefault(source, []).append({
            "section_id": section_id,
            "section_hash": section_hash,
            "last_modified": last_modified.isoformat() if last_modified else None,
        })

    metadata = [{"source": src, "sections": secs} for src, secs in grouped.items()]
    return {"metadata": metadata}


@app.delete("/delete/{filename}")
def delete_by_filename(filename: str):
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM documents WHERE source = %s", (filename,))
        deleted = cur.rowcount
        conn.commit()
        cur.close()
    finally:
        conn.close()
    return {"status": "success", "filename": filename, "deleted": deleted}


@app.delete("/delete-all")
def delete_all():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM documents")
        deleted = cur.rowcount
        conn.commit()
        cur.close()
    finally:
        conn.close()
    return {"status": "success", "deleted": deleted}
