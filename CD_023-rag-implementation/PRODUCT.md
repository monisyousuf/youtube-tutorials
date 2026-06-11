# Product

Miniature RAG System — a self-contained RAG demo for asking questions over a set of markdown documents. Built for learning and exploration; every step of the pipeline is visible in the code.

---

## Features

### Chat
Ask questions in natural language. The system retrieves the most relevant document sections and uses an LLM to generate a grounded answer.

- **Stateless mode** — each question is independent. No memory of previous turns.
- **Conversational mode** — maintains conversation history. Follow-up questions are automatically rewritten into standalone queries before retrieval, so context carries across turns.

### Vectorizer
Manages document embeddings in the database.

- **Fetch Documentation** — loads the list of available markdown files from the documentation service.
- **Vectorize** — embeds a selected document and stores it in the database. Re-running on an unchanged document is a no-op (change detection via content hash). Reports "already up-to-date" if nothing changed.
- **Vectorize All** — fetches all documents and vectorizes them in sequence. Only changed sections are re-embedded.
- **View Metadata** — shows which documents and sections have embeddings in the database, along with a content hash and the timestamp of the last embedding update for each section.
- **Delete Vectors** — removes all embeddings for a specific document.
- **Delete Everything** — wipes the entire vector database (with confirmation).

### Settings
- Select LLM provider: **Anthropic (Claude)** or **OpenAI (GPT)**.
- Enter the API key for each provider. Keys are stored per-provider in memory and cleared on page refresh — never written to disk or sent anywhere other than the provider's API.

### Commands
Quick reference of useful CLI commands for interacting with the running stack (e.g. connecting directly to the database).

---

## Getting Started

**1. Start the stack**
```bash
docker compose up --build
```
Open **http://localhost** in your browser. First run takes a few minutes — the embedding model (~90 MB) is downloaded at startup.

**2. Configure your LLM provider**

Go to **Settings** → select a provider → paste your API key → click **Save**.

**3. Vectorize your documents**

Go to **Vectorizer** → click **Fetch Documentation** → select a file → click **Vectorize**. Use **Vectorize All** to embed every document in one step. You'll see a confirmation with the number of chunks updated (or "already up-to-date" if nothing changed).

**4. Start chatting**

Go to **Chat** → type a question → press Enter.

---

## Adding Your Own Documents

1. Add `.md` files to `documentation/docs/`. Files must have H2 sections (`## Heading`) — the vectorizer chunks on these boundaries.

   Recommended format:
   ```markdown
   ---
   title: My Document
   category: My Category
   ---

   ## Section One
   Content here...

   ## Section Two
   More content...
   ```

2. Rebuild the documentation service:
   ```bash
   docker compose build documentation && docker compose up -d documentation
   ```

3. In the browser: **Vectorizer** → **Fetch Documentation** → select the new file → **Vectorize**.

---

## Modes at a Glance

| | Stateless | Conversational |
|---|---|---|
| Memory of prior turns | No | Yes |
| Query rewriting | No | Yes (LLM rewrites follow-ups) |
| Extra LLM call per turn | No | Yes (only when history exists) |
| Best for | One-off lookups | Multi-turn exploration |
