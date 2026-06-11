# RAG POC

A self-contained Retrieval-Augmented Generation proof-of-concept using Postgres + pgvector, sentence-transformers, and your choice of Anthropic (Claude) or OpenAI (GPT). No LangChain, no LlamaIndex — every step of the pipeline is implemented directly so the code teaches the concepts.

- [Product Guide](PRODUCT.md) — features, usage, and how to add your own documents
- [Architecture](ARCHITECTURE.md) — system diagram, service descriptions, database schema

---

## Architecture

```
Browser
   |
   | HTTP :80
   v
┌─────────────┐
│   frontend  │  React + Vite, served by nginx
│  (nginx:80) │
└──────┬──────┘
       │ nginx reverse-proxy
  ┌────┴────────────────────┐
  │    /api/   /docs-api/   /vectorizer-api/
  v            v                  v
┌──────────┐ ┌───────────────┐ ┌────────────┐
│ backend  │ │ documentation │ │ vectorizer │
│  :8000   │ │    :8001      │ │   :8002    │
└────┬─────┘ └───────────────┘ └─────┬──────┘
     │                               │
     └──────────────┬────────────────┘
                    │ psycopg2
                    v
             ┌────────────┐
             │  database  │
             │ postgres:  │
             │   5432     │
             │ + pgvector │
             └────────────┘
```

---

## How to Run

```bash
docker compose up --build
```

Open **http://localhost** in your browser.

> First run takes a few minutes — the sentence-transformers model (~90 MB) is downloaded at container startup for both `backend` and `vectorizer`.

---

## First-Time Setup Walkthrough

1. **Settings tab** (gear icon in the sidebar)
   - Choose your LLM provider: **Anthropic (Claude)** or **OpenAI (GPT)**
   - Enter your API key and click **Save**

2. **Graph tab** (database icon)
   - Click **Fetch Documentation** — this loads the list of markdown files from the documentation service
   - Select a file from the dropdown and click **Vectorize**
   - Repeat for each document you want searchable
   - You'll see a green banner with the number of chunks embedded

3. **Chat tab** (message icon)
   - Type a question and press Enter
   - The system retrieves relevant chunks, builds a prompt, and calls the LLM

---

## How RAG Works Here

**Ingestion:** The `vectorizer` service fetches a markdown file from the `documentation` service, splits it into chunks on H2 headings, prepends a context prefix (`[Title | Category | Heading]`), and embeds each chunk using `all-MiniLM-L6-v2` (384 dimensions). Chunks are upserted into Postgres with their embedding and a SHA-256 hash of their content — re-running vectorize on an unchanged file is a no-op.

**Retrieval:** When the user sends a question, the `backend` embeds the query with the same model and runs a hybrid search: a vector similarity search using pgvector's cosine distance and a full-text search using Postgres `ts_rank`. The two ranked lists are merged with Reciprocal Rank Fusion (RRF), which rewards chunks that rank highly in both searches. The top 5 results become the context window.

**Generation:** The retrieved chunks are formatted into a system prompt that instructs the LLM to answer only from the provided context. The user's question (and conversation history in conversational mode) is passed to the selected LLM — Claude Haiku or GPT-4o-mini — which produces the final answer.

---

## Stateless vs. Conversational Mode

**Stateless** treats every question independently — no memory of previous turns. Each request sends only the current question and the retrieved context. This is the simplest mode and the easiest to reason about.

**Conversational** maintains a history of previous turns. Before retrieval, if there is existing history, the backend calls the LLM a second time to *rewrite* the user's follow-up question into a standalone question that includes all necessary context from the history — for example, "what about the cliff?" becomes "what is the cliff period in the RSU vesting schedule?". This rewritten question is used only for retrieval; the original question is what gets sent to the final LLM call. Switching back to Stateless clears the history.

---

## Adding Your Own Documentation

1. Add `.md` files to `documentation/docs/`. Each file should follow the format:

```markdown
---
title: My Document
category: My Category
---

# My Document

## Section One
Content here...

## Section Two
More content...
```

2. Rebuild the documentation service: `docker compose build documentation && docker compose up -d documentation`

3. In the browser, click **Fetch Documentation** in the Graph tab — your new file will appear in the dropdown.

4. Select it and click **Vectorize**.
