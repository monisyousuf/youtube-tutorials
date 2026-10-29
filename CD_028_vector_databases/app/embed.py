"""
Text -> embedding, and embedding vs embedding -> similarity.

This file is shared by the web tool (main.py) and the tests.
"""
from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

# The exact model and revision used for every number in the video.
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
MODEL_REVISION = "1110a243fdf4706b3f48f1d95db1a4f5529b4d41"
DIMENSIONS = 384

MINUS = "−"  # a real minus sign "−", not a hyphen "-"


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    """Load the model once. It was baked into the Docker image, so this reads from disk."""
    return SentenceTransformer(MODEL_NAME, revision=MODEL_REVISION, device="cpu")


def embed(text: str) -> np.ndarray:
    """
    Turn a piece of text into 384 numbers.

    The text goes in EXACTLY as given: no trimming, no lower-casing, no added full stop.
    A full stop is a token of its own and would move the score.

    normalize_embeddings=True scales the vector to length 1.0.
    """
    return get_model().encode(text, normalize_embeddings=True)


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """
    cosine similarity = A·B / (|A| |B|)

    Our vectors are normalised (|A| = |B| = 1), so the denominator is 1 and this is just
    the dot product. We still write the full formula, because that's the one from the video.
    """
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def format_number(x: float) -> str:
    """0.0329 -> "+0.03", -0.038 -> "−0.04", -0.001 -> "0.00"."""
    text = f"{abs(x):.2f}"
    if text == "0.00":
        return text  # never show "−0.00" or "+0.00"
    return (MINUS if x < 0 else "+") + text


def clip(vector) -> str:
    """
    Show the first three numbers and the last one, the way the video does:
        [+0.03, +0.02, +0.06, …, −0.04]
    Same rules as the web page (static/index.html).
    """
    first = [format_number(x) for x in vector[:3]]
    return "[" + ", ".join(first) + ", …, " + format_number(vector[-1]) + "]"
