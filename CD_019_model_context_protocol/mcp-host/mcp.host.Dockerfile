FROM python:3.11-slim

WORKDIR /app

# Install dependencies, rest will be mounted
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt