"""
Every number shown in the video, checked against the pinned stack.

Run inside the image:  docker compose run --rm test

If a value is off by more than 0.001, don't change the inputs or the tolerance:
the stack is wrong. Check the pins in app/requirements.txt and the model revision.
"""
import os
import sys
from importlib.metadata import version

import numpy as np
import pytest

from embed import DIMENSIONS, MODEL_REVISION, clip, cosine_similarity, embed

TOLERANCE = 0.001

# The 8 documents, ids 1-8, exactly as in demo/00_create_table.sql.
CORPUS = [
    "Annual Leave Policy: employees accrue 2.33 days of paid leave each month.",
    "Employees are entitled to 28 days of annual leave every calendar year.",
    "Sick Leave Policy: notify your manager before 9am on the first day of absence.",
    "Expense Reimbursement: submit receipts within 30 days of travel.",
    "Notice period for resignation is three months for senior staff.",
    "Parental leave may be taken for up to 12 months following the birth of a child.",
    "The office is closed on public holidays observed in Berlin.",
    "Remote work is permitted up to three days per week with manager approval.",
]
QUERY = "vacation days per year"

BEACH = "I am taking two weeks of leave to relax at the beach"
PAIRS = [
    ("vacation days per year", "annual leave", 0.551),        # Ch2 "0.55", the tool's pre-filled pair
    ("vacation", "database", 0.150),                          # the "unrelated" control
    ("taking leave", "leave the company", 0.562),             # Ch3 "0.56", a false match
    (BEACH, "He decided to leave the company after ten years", 0.058),  # Ch3 "0.06"
    (BEACH, "I am going on vacation to the seaside for two weeks", 0.757),
    ("vacation days per year", "office rent per year", 0.424),
    ("dog", "puppy", 0.804),
    ("dog", "lion", 0.491),
    ("dog", "goldfish", 0.388),
]

# Query vs every row of the corpus, best first: (row id, similarity)
RANKING = [(2, 0.578), (1, 0.556), (7, 0.291), (3, 0.277), (4, 0.268), (8, 0.261), (5, 0.256), (6, 0.221)]

# Clipped embeddings (d1, d2, d3, ..., d384) as the web tool shows them.
TOOL_CLIPS = {
    "vacation days per year": "[+0.03, +0.02, +0.06, …, −0.04]",
    "annual leave": "[+0.05, +0.05, +0.04, …, 0.00]",
    "vacation": "[+0.01, +0.04, +0.06, …, −0.01]",
    "database": "[+0.05, −0.02, −0.09, …, −0.05]",
    "taking leave": "[+0.05, +0.05, +0.02, …, 0.00]",
    "leave the company": "[0.00, +0.04, +0.02, …, +0.01]",
    BEACH: "[+0.09, −0.03, +0.07, …, +0.02]",
    "He decided to leave the company after ten years": "[0.00, −0.01, +0.03, …, 0.00]",
}

# Stored embeddings for rows 1-8 in pgvector's text style.
STORED_CLIPS = {
    1: "[0.11, 0.00, 0.02, …, −0.01]",
    2: "[0.06, 0.03, 0.08, …, 0.00]",
    3: "[0.05, 0.03, 0.03, …, 0.02]",
    4: "[0.03, 0.04, 0.04, …, −0.06]",
    5: "[0.05, 0.01, 0.06, …, −0.03]",
    6: "[0.02, −0.01, 0.00, …, 0.02]",
    7: "[0.05, 0.03, 0.01, …, 0.04]",
    8: "[0.01, −0.04, 0.06, …, 0.00]",
}


# --- The stack itself ---------------------------------------------------------------------

def test_stack_is_pinned():
    assert sys.version_info[:3] == (3, 13, 1)
    assert version("torch") == "2.13.0+cpu"
    assert version("sentence-transformers") == "6.0.1"
    assert version("transformers") == "5.16.1"
    assert version("numpy") == "2.5.2"
    assert MODEL_REVISION == "1110a243fdf4706b3f48f1d95db1a4f5529b4d41"


def test_model_is_offline():
    assert os.environ.get("HF_HUB_OFFLINE") == "1"


# --- Part 1: the similarity tool ------------------------------------------------------------

@pytest.mark.parametrize("a, b, expected", PAIRS)
def test_pair_similarity(a, b, expected):
    assert cosine_similarity(embed(a), embed(b)) == pytest.approx(expected, abs=TOLERANCE)


@pytest.mark.parametrize("text, expected", TOOL_CLIPS.items())
def test_tool_clipped_embedding(text, expected):
    assert clip(embed(text), signed=True) == expected


ALL_TEXTS = sorted({t for a, b, _ in PAIRS for t in (a, b)} | set(CORPUS) | {QUERY})


@pytest.mark.parametrize("text", ALL_TEXTS)
def test_embedding_shape_and_length(text):
    vector = embed(text)
    assert vector.shape == (DIMENSIONS,) == (384,)
    assert float(np.linalg.norm(vector)) == pytest.approx(1.0, abs=1e-4)


def test_api_prefilled_pair():
    from fastapi.testclient import TestClient
    from main import app

    with TestClient(app) as client:
        result = client.post("/api/similarity", json={"a": "vacation days per year", "b": "annual leave"}).json()
    assert f"{result['similarity']:.2f}" == "0.55"
    assert result["label"] == "similar"
    assert len(result["a"]["embedding"]) == len(result["b"]["embedding"]) == 384
    assert clip(result["a"]["embedding"]) == "[+0.03, +0.02, +0.06, …, −0.04]"
    assert clip(result["b"]["embedding"]) == "[+0.05, +0.05, +0.04, …, 0.00]"


@pytest.mark.parametrize("similarity, label", [
    (0.551, "similar"), (0.562, "similar"), (0.424, "somewhat related"),
    (0.291, "unrelated"), (0.150, "unrelated"), (0.058, "unrelated"),
])
def test_labels(similarity, label):
    from main import label_for

    assert label_for(similarity) == label


def test_clip_formatting_rules():
    assert clip([0.0329, -0.001, 0.004, -0.038]) == "[+0.03, 0.00, 0.00, …, −0.04]"
    assert clip([0.0329, -0.001, 0.004, -0.038], signed=False) == "[0.03, 0.00, 0.00, …, −0.04]"
    assert "−" in clip([-0.5, 0, 0, 0])  # a real minus sign, not a hyphen


# --- Part 2: ranking (no database needed) ----------------------------------------------------

def test_full_ranking_over_corpus():
    query = embed(QUERY)
    scores = [(i + 1, cosine_similarity(query, embed(text))) for i, text in enumerate(CORPUS)]
    scores.sort(key=lambda s: s[1], reverse=True)
    assert [row for row, _ in scores] == [row for row, _ in RANKING]
    for (_, got), (_, expected) in zip(scores, RANKING):
        assert got == pytest.approx(expected, abs=TOLERANCE)


@pytest.mark.parametrize("row, expected", STORED_CLIPS.items())
def test_stored_clipped_embedding(row, expected):
    assert clip(embed(CORPUS[row - 1]), signed=False) == expected


# --- Part 2: the real demo against Postgres + pgvector --------------------------------------

@pytest.fixture(scope="module")
def demo():
    if not os.environ.get("DATABASE_URL"):
        pytest.skip("DATABASE_URL not set: run with `docker compose run --rm test`")
    from run_demo import connect, run

    conn = connect()
    results = run(conn, hnsw=True)
    yield conn, results
    conn.close()


def test_demo_corpus_matches(demo):
    conn, _ = demo
    rows = conn.execute("SELECT id, content FROM documents ORDER BY id").fetchall()
    assert rows == list(enumerate(CORPUS, start=1))


def test_demo_keyword_search_finds_nothing(demo):
    _, results = demo
    assert results["keyword_rows"] == []
    assert results["tsquery"] == "'vacat' & 'day' & 'per' & 'year'"


@pytest.mark.parametrize("key", ["top3", "hnsw_top3"])
def test_demo_cosine_search_top3(demo, key):
    _, results = demo
    expected = [(CORPUS[row - 1], similarity) for row, similarity in RANKING[:3]]
    assert [content for content, _ in results[key]] == [content for content, _ in expected]
    for (_, got), (_, want) in zip(results[key], expected):
        assert got == pytest.approx(want, abs=TOLERANCE)


def test_demo_stored_embeddings(demo):
    conn, _ = demo
    for row, stored in conn.execute("SELECT id, embedding FROM documents ORDER BY id"):
        vector = stored.to_numpy()  # pgvector gives back a Vector; we compare it as numbers
        assert vector.shape == (384,)
        assert float(np.linalg.norm(vector)) == pytest.approx(1.0, abs=1e-4)
        assert clip(vector, signed=False) == STORED_CLIPS[row]
