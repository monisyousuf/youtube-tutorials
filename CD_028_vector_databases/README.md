# How Vector Databases Work

The code from the video: the tiny tool that takes two pieces of text and outputs their similarity. The cut-offs are defined by us, not by the model!

📺 Video: `https://www.youtube.com/watch?v=m6UbzpgRgtU`

## QuickStart

You only need [Docker Desktop](https://www.docker.com/products/docker-desktop/).

1. Go to this folder

    ```shell
    cd <directory_where_this_repo_is_cloned>/CD_028_vector_databases
    ```

2. Start the tool

    ```shell
    docker compose up
    ```

    The first run downloads and builds about 1.5 GB, so give it a few minutes. When you see `Uvicorn running on http://0.0.0.0:8000`, open **http://localhost:8000**.

3. Stop it when you're done: `Ctrl+C`, then

    ```shell
    docker compose down
    ```

If you have `make`, the shortcuts are `make up` and `make test`.

## What does it show?

Type two pieces of text and click **Calculate**. For each text you'll see:

- its **embedding**, clipped to the first three numbers and the last one, e.g. `[+0.03, +0.02, +0.06, …, −0.04]`. Click "show all 384" for the full vector.
- the **cosine similarity** of the two embeddings, plus a tag: *similar*, *somewhat related* or *unrelated*.

The interesting code is short:

- [app/embed.py](./app/embed.py) turns text into 384 numbers and computes `A·B / (|A||B|)`.
- [app/main.py](./app/main.py) is the API, and holds the cut-offs for the tags.

## Try these

Paste these pairs into the tool. Hover over a score to see the third decimal.

| Text A | Text B | Similarity | Tag |
|---|---|---:|---|
| `vacation days per year` | `annual leave` | 0.55 (0.551) | similar |
| `vacation` | `database` | 0.15 (0.150) | unrelated |
| `taking leave` | `leave the company` | 0.56 (0.562) | similar |
| `I am taking two weeks of leave to relax at the beach` | `He decided to leave the company after ten years` | 0.06 (0.058) | unrelated |
| `I am taking two weeks of leave to relax at the beach` | `I am going on vacation to the seaside for two weeks` | 0.76 (0.757) | similar |
| `vacation days per year` | `office rent per year` | 0.42 (0.424) | somewhat related |
| `dog` | `puppy` | 0.80 (0.804) | similar |
| `dog` | `lion` | 0.49 (0.491) | somewhat related |
| `dog` | `goldfish` | 0.39 (0.388) | somewhat related |

Type them exactly as shown, with no full stop at the end. A full stop is a token of its own and changes the score.

Now compare the first and third rows. `vacation days per year` and `annual leave` share **no word** and mean the same thing: **0.55**. `taking leave` and `leave the company` share a word and mean something completely different: **0.56**. The false match scores *higher* than the real one.

The tags come from cut-offs that **we** picked (≥ 0.50, 0.30–0.49, < 0.30), not the model. You can change them in one place, `BANDS` in [app/main.py](./app/main.py), then restart with `docker compose up --build`.

So: ***where would you draw the line?***

## Why are the versions pinned?

An embedding is just numbers, and those numbers depend on the exact model files and the exact code running them. A different version of PyTorch or of `transformers` can move the third decimal. That's why everything is pinned:

| | Version |
|---|---|
| Python | 3.13.1 |
| torch | 2.13.0 (CPU) |
| sentence-transformers | 6.0.1 |
| transformers | 5.16.1 |
| numpy | 2.5.2 |
| Model | [`sentence-transformers/all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) at revision `1110a243fdf4706b3f48f1d95db1a4f5529b4d41` |

The model is downloaded once, while the image is built. After that, nothing is downloaded: the tool works offline.

To check that your machine gives the video's numbers, run the tests:

```shell
docker compose run --rm test
```

They check every number from the table above, plus the clipped embeddings the tool shows.

## Credits

- [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) by [sentence-transformers](https://www.sbert.net/), Apache-2.0 licence.
