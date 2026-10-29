# One image for the similarity tool (app/) and its tests (tests/).
# Builds on Apple Silicon (linux/arm64) and Intel/AMD (linux/amd64).
FROM python:3.13.1-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    HF_HOME=/opt/huggingface \
    PYTHONPATH=/code/app

WORKDIR /code

COPY app/requirements.txt app/requirements.txt
RUN pip install --no-cache-dir -r app/requirements.txt

# Fail the build if any dependency dragged in a different version of the ML stack.
RUN pip freeze > /tmp/freeze.txt \
 && for pin in torch==2.13.0+cpu sentence-transformers==6.0.1 transformers==5.16.1 numpy==2.5.2; do \
      grep -qx "$pin" /tmp/freeze.txt || { echo "Pin drifted: expected $pin"; grep -iE "^(torch|sentence-transformers|transformers|numpy)==" /tmp/freeze.txt; exit 1; }; \
    done

# Download the model ONCE, at build time, at the exact revision used in the video.
RUN python -c "from sentence_transformers import SentenceTransformer; \
SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', revision='1110a243fdf4706b3f48f1d95db1a4f5529b4d41')"

# From here on, nothing is downloaded: the model comes from the image.
ENV HF_HUB_OFFLINE=1 \
    TRANSFORMERS_OFFLINE=1 \
    HF_HUB_DISABLE_PROGRESS_BARS=1

COPY app app
COPY tests tests

EXPOSE 8000
CMD ["uvicorn", "main:app", "--app-dir", "app", "--host", "0.0.0.0", "--port", "8000"]
