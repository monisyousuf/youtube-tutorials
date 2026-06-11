CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS documents (
    id            SERIAL PRIMARY KEY,
    source        TEXT NOT NULL,
    section_id    TEXT NOT NULL,
    section_hash  TEXT NOT NULL,
    content       TEXT NOT NULL,
    embedding     vector(384),
    fts           tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
    last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_source_section
    ON documents (source, section_id);

CREATE INDEX IF NOT EXISTS idx_documents_embedding
    ON documents USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_documents_fts
    ON documents USING gin (fts);
