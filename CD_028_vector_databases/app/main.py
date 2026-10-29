"""
Part 1: the similarity tool from the video (Ch2, "What is an Embedding Model?").

Type two pieces of text, get their embeddings and their cosine similarity.
Run with:  docker compose up   ->   http://localhost:8000
"""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel

from embed import cosine_similarity, embed, get_model

# The labels are OUR choice, not the model's. The model only gives a number.
# Change the cut-offs here: the API and the legend on the page both read this list.
# A score gets the first label whose cut-off it reaches (after rounding to 2 decimals,
# so the number on screen and its label always agree).
BANDS = [
    (0.50, "similar"),
    (0.30, "somewhat related"),
    (float("-inf"), "unrelated"),
]


def label_for(similarity: float) -> str:
    shown = round(similarity, 2)
    for cutoff, label in BANDS:
        if shown >= cutoff:
            return label


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_model()  # load the model once, at startup, not on the first click
    embed("warm-up")  # the very first encode is slow; get it out of the way too
    yield


app = FastAPI(lifespan=lifespan)
STATIC = Path(__file__).parent / "static"


class Pair(BaseModel):
    a: str
    b: str


@app.post("/api/similarity")
def similarity(pair: Pair):
    a = embed(pair.a)
    b = embed(pair.b)
    score = cosine_similarity(a, b)
    return {
        "similarity": score,
        "label": label_for(score),
        "a": {"embedding": a.tolist()},
        "b": {"embedding": b.tolist()},
    }


@app.get("/api/bands")
def bands():
    """For the legend under the result, so the page never disagrees with BANDS above."""
    return [
        {"cutoff": None if cutoff == float("-inf") else cutoff, "label": label}
        for cutoff, label in BANDS
    ]


@app.get("/")
def index():
    return FileResponse(STATIC / "index.html")
