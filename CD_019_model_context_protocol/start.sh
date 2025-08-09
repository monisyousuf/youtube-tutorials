#!/usr/bin/env bash
set -euo pipefail

docker compose exec mcp-host python3 app/app.py