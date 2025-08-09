#!/usr/bin/env python3
"""Small host app that 

1. Performs initialization against configured MCP servers and caches the responses for later use by an LLM.

"""
import sys
import os
import time
import json
from typing import Any, Dict

# Ensure the local mcp-clients directory is importable
HERE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.abspath(os.path.join(HERE, os.pardir))
CLIENTS_PATH = os.path.join(PARENT, "mcp-clients")
if CLIENTS_PATH not in sys.path:
    sys.path.insert(0, CLIENTS_PATH)

# Import specific clients (these modules live in mcp-clients/)
from order_management_system_client import OrderManagementSystemClient
from user_profile_client import UserProfileClient

import state_manager
from config import get_server_url

# Configuration: mapping logical names -> client class + config url_key
SERVERS = {
    "order_management_system": {"class": OrderManagementSystemClient, "url_key": "order_management_system"},
    "user_profile": {"class": UserProfileClient, "url_key": "user_profile"},
}

RETRY_DELAY = 2  # seconds between tries
MAX_RETRIES = 5  # number of attempts per server


def try_initialize(name: str, client_cls, url: str) -> Dict[str, Any]:
    """
    Try to call initialize() on a specific client class against the given URL,
    retrying a few times on transient errors.
    """
    client = client_cls(url)
    last_exc = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"Initializing {name} (attempt {attempt}) against {url}...")
            resp = client.initialize()
            print(f"Initialization of {name} succeeded.")
            return resp
        except Exception as e:
            last_exc = e
            print(f"Initialization attempt {attempt} for {name} failed: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY)
    raise RuntimeError(f"Failed to initialize {name} after {MAX_RETRIES} attempts") from last_exc


def main() -> None:
    # Load any existing cached initialize responses
    cached = state_manager.load_init_responses()
    print("Loaded cached initialize responses:")
    print(json.dumps(cached or {}, indent=2))

    initialize_responses: Dict[str, Any] = {}
    for name, cfg in SERVERS.items():
        try:
            url = get_server_url(cfg["url_key"])
            resp = try_initialize(name, cfg["class"], url)
            initialize_responses[name] = resp
        except Exception as e:
            print(f"ERROR: Unable to initialize {name}: {e}")

    if initialize_responses:
        # Persist the responses for later use (LLM will later read this file)
        state_manager.save_init_responses(initialize_responses)
        print("Saved initialize responses to:", state_manager.get_cache_path())
        print(json.dumps(initialize_responses, indent=2))
    else:
        print("No initialize responses obtained.")

    # Minimal REPL for operator use / inspection
    try:
        print("\nEntering minimal REPL. Type 'show' to view cached init responses, 'exit' to quit.")
        while True:
            try:
                cmd = input("mcp-host> ").strip()
            except EOFError:
                print("\nEOF received, exiting REPL.")
                break

            if not cmd:
                continue
            if cmd in ("exit", "quit"):
                print("Bye")
                break
            if cmd == "show":
                print(json.dumps(state_manager.load_init_responses() or {}, indent=2))
                continue
            print("Unknown command. Available: show, exit")
    except KeyboardInterrupt:
        print("\nInterrupted by user, exiting.")


if __name__ == "__main__":
    main()