import os
from typing import Any

import anthropic
import psycopg2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI(title="RAG Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL")

# Load embedding model once at startup (384 dimensions)
embed_model = SentenceTransformer("all-MiniLM-L6-v2")


class ChatRequest(BaseModel):
    user_prompt: str
    rag_type: str  # "stateless" | "conversational"
    history: list[dict[str, Any]] = []
    llm_provider: str  # "anthropic" | "openai"
    api_key: str


class ChatResponse(BaseModel):
    response: str
    history: list[dict[str, Any]]


def rewrite_query(user_prompt: str, history: list, provider: str, api_key: str) -> str:
    """Rewrite the user prompt as a standalone question given the conversation history."""
    system = (
        "You are a query rewriting assistant. Given the conversation history and a follow-up "
        "question, rewrite the follow-up as a complete, standalone question that contains all "
        "necessary context from the history. Return ONLY the rewritten question, nothing else."
    )
    messages = history + [{"role": "user", "content": user_prompt}]

    try:
        if provider == "anthropic":
            client = anthropic.Anthropic(api_key=api_key)
            resp = client.messages.create(
                model="claude-haiku-4-5",
                max_tokens=256,
                system=system,
                messages=messages,
            )
            return resp.content[0].text.strip()
        else:
            client = OpenAI(api_key=api_key)
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                max_tokens=256,
                messages=[{"role": "system", "content": system}] + messages,
            )
            return resp.choices[0].message.content.strip()
    except Exception:
        # Fall back to original query on rewrite failure
        return user_prompt


def rrf_merge(semantic_rows: list, keyword_rows: list, k: int = 60) -> list[str]:
    scores: dict[int, float] = {}
    content_map: dict[int, str] = {}

    for rank, (id_, content) in enumerate(semantic_rows, 1):
        scores[id_] = scores.get(id_, 0) + 1.0 / (k + rank)
        content_map[id_] = content

    for rank, (id_, content) in enumerate(keyword_rows, 1):
        scores[id_] = scores.get(id_, 0) + 1.0 / (k + rank)
        content_map[id_] = content

    sorted_ids = sorted(scores, key=scores.get, reverse=True)
    return [content_map[id_] for id_ in sorted_ids[:5]]


def retrieve_chunks(query: str) -> list[str]:
    embedding = embed_model.encode(query).tolist()

    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT id, content
            FROM documents
            ORDER BY embedding <=> %s::vector
            LIMIT 20
            """,
            (embedding,),
        )
        semantic_rows = [(row[0], row[1]) for row in cur.fetchall()]

        cur.execute(
            """
            SELECT id, content,
                   ROW_NUMBER() OVER (ORDER BY ts_rank(fts, plainto_tsquery('english', %s)) DESC) AS rank
            FROM documents
            WHERE fts @@ plainto_tsquery('english', %s)
            LIMIT 20
            """,
            (query, query),
        )
        keyword_rows = [(row[0], row[1]) for row in cur.fetchall()]

        cur.close()
    finally:
        conn.close()

    return rrf_merge(semantic_rows, keyword_rows)


def build_system_prompt(chunks: list[str]) -> str:
    context_blocks = "\n---\n".join(chunks)
    return (
        "You are a helpful assistant. Answer the user's question using ONLY the context "
        "provided below. If the answer is not in the context, say clearly that you don't "
        "have that information. Do not make up information.\n\n"
        f"Context:\n---\n{context_blocks}"
    )


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    # Step 1 — Query preparation
    retrieval_query = req.user_prompt
    if req.rag_type == "conversational" and req.history:
        retrieval_query = rewrite_query(req.user_prompt, req.history, req.llm_provider, req.api_key)

    # Step 2 — Hybrid retrieval
    chunks = retrieve_chunks(retrieval_query)
    if not chunks:
        return ChatResponse(
            response="I couldn't find any relevant information in the documentation to answer your question.",
            history=[],
        )

    # Step 3 — Prompt construction with Augmentation
    system_prompt = build_system_prompt(chunks)

    # Step 4 — LLM generation
    messages = req.history + [{"role": "user", "content": req.user_prompt}]

    try:
        if req.llm_provider == "anthropic":
            client = anthropic.Anthropic(api_key=req.api_key)
            resp = client.messages.create(
                model="claude-haiku-4-5",
                max_tokens=1024,
                system=system_prompt,
                messages=messages,
            )
            answer = resp.content[0].text
        else:
            client = OpenAI(api_key=req.api_key)
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                max_tokens=1024,
                messages=[{"role": "system", "content": system_prompt}] + messages,
            )
            answer = resp.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"LLM error: {e}")

    # Step 5 — Return
    updated_history: list[dict[str, Any]] = []
    if req.rag_type == "conversational":
        updated_history = req.history + [
            {"role": "user", "content": req.user_prompt},
            {"role": "assistant", "content": answer},
        ]

    return ChatResponse(response=answer, history=updated_history)
