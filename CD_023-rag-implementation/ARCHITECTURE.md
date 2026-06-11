# Architecture

## System Diagram

```
Browser
   |
   | HTTP :80
   v
┌─────────────────────────────┐
│          frontend           │  React + Vite, served by nginx
│          (nginx:80)         │
└──────────────┬──────────────┘
               │ nginx reverse-proxy
   ┌───────────┼───────────────────┐
   │           │                   │
/api/*    /docs-api/*    /vectorizer-api/*
   │           │                   │
   v           v                   v
┌──────────┐ ┌───────────────┐ ┌────────────┐
│ backend  │ │ documentation │ │ vectorizer │
│  :8000   │ │    :8001      │ │   :8002    │
└────┬─────┘ └───────┬───────┘ └─────┬──────┘
     │               │               │
     │               │ HTTP (fetch)  │
     │               └──────────────>│
     │                               │
     └───────────────┬───────────────┘
                     │ psycopg2
                     v
              ┌────────────┐
              │  database  │
              │ PostgreSQL │
              │   :5432    │
              │ + pgvector │
              └────────────┘
```

All services are containerised and orchestrated with Docker Compose. The frontend's nginx instance is the only public entry point — all backend traffic is proxied through it.

---

## Frontend

A React + Vite single-page application served by nginx. Communicates with all backend services via the nginx proxy.

**Tabs:**

- **Chat** — RAG query interface. Sends user questions to the backend and renders markdown responses. Supports stateless and conversational modes.
- **Vectorizer** — Document ingestion UI. Fetches the list of available markdown files, triggers vectorization, inspects embedding metadata, and manages (deletes) stored vectors.
- **Commands** — Reference sheet of useful CLI commands for interacting with the running stack.
- **Settings** — LLM provider and API key configuration. Keys are stored per-provider in memory only and are never persisted.

---

## Backend (`/api/*`)

FastAPI service. Handles all RAG query logic.

**`POST /chat`** — Entry point. Orchestrates the full RAG pipeline:

1. **Query preparation** — If conversational mode and history exists, calls `rewrite_query()` to produce a standalone retrieval query.
2. **Retrieval** — Calls `retrieve_chunks()` to fetch the most relevant document chunks from the database.
3. **Prompt construction** — Calls `build_system_prompt()` to wrap chunks into an LLM-ready context block.
4. **LLM call** — Sends history + user question to Claude Haiku or GPT-4o-mini and returns the answer.

**Supporting functions:**

| Function | Description |
|---|---|
| `rewrite_query(prompt, history, provider, key)` | Uses the LLM to rewrite a follow-up question into a self-contained query so retrieval works correctly without conversation context. |
| `retrieve_chunks(query)` | Embeds the query, runs semantic search and keyword search in parallel, merges results via RRF, returns top 5 chunks. |
| `rrf_merge(semantic_rows, keyword_rows)` | Reciprocal Rank Fusion — scores chunks by their rank position across both result lists. Chunks appearing in both lists score higher than those dominating only one. |
| `build_system_prompt(chunks)` | Formats the top chunks into a system prompt that instructs the LLM to answer only from the provided context. |

---

## Database

PostgreSQL with the **pgvector** extension. Stores document chunks alongside their vector embeddings for hybrid retrieval.

**Table: `documents`**

| Column | Type | Purpose |
|---|---|---|
| `id` | serial | Primary key |
| `source` | text | Filename the chunk came from |
| `section_id` | text | Slugified H2 heading — stable identifier for the section |
| `section_hash` | text | SHA-256 of the chunk content — used to skip re-embedding unchanged sections |
| `content` | text | Full chunk text in the format `[Title \| Category \| Heading]\n\nbody` |
| `embedding` | vector(384) | `all-MiniLM-L6-v2` embedding of the content |
| `fts` | tsvector (generated) | Auto-maintained full-text search index over `content` |
| `last_modified` | timestamptz | Timestamp of the last embedding update — only written when a chunk is actually changed |

**Why this schema:**

- `(source, section_id)` is a unique key — enforces one row per document section and allows clean upserts when a document is re-vectorized.
- `section_hash` enables change detection — if the content hasn't changed, the embedding is not recomputed and `last_modified` is not updated.
- Storing `[Title | Category | Heading]` as a prefix in `content` gives the embedding model structural context, improving retrieval quality.
- The `fts` generated column keeps full-text search in sync automatically — no manual updates needed.
- `last_modified` reflects when a section was last meaningfully changed, not when it was last checked — making it useful for auditing embedding freshness.

**Indexes:**

| Index | Type | Purpose |
|---|---|---|
| `idx_documents_source_section` | UNIQUE B-tree | Enforces one row per (source, section_id) |
| `idx_documents_embedding` | HNSW (cosine) | Approximate nearest-neighbour vector search — avoids full table scan at scale |
| `idx_documents_fts` | GIN | Fast full-text search |

---

## Vectorizer (`/vectorizer-api/*`)

FastAPI service. Handles all document ingestion — fetching, parsing, chunking, embedding, and storing.

**`POST /vectorize`** — Main ingestion flow:

1. Fetches the markdown file from the documentation service.
2. Calls `parse_frontmatter()` to extract title and category metadata.
3. Calls `chunk_by_h2()` to split the body into one chunk per H2 section.
4. For each chunk: checks `section_hash` against the DB — skips if unchanged, otherwise embeds and upserts.
5. Deletes any DB rows for sections that no longer exist in the document.

**`GET /metadata`** — Returns all stored sections grouped by source, including `section_id`, a truncated `section_hash`, and `last_modified` timestamp per section. Used by the frontend metadata inspector.

**`DELETE /delete/{filename}`** — Removes all rows where `source = filename`.

**`DELETE /delete-all`** — Truncates the entire `documents` table.

**Supporting functions:**

| Function | Description |
|---|---|
| `slugify(text)` | Converts a heading string to a lowercase hyphenated slug for use as `section_id`. |
| `parse_frontmatter(raw)` | Strips the YAML-style `---` frontmatter block and returns metadata dict + body. |
| `chunk_by_h2(body)` | Splits markdown on `## ` boundaries and returns `(heading, content)` pairs. |
