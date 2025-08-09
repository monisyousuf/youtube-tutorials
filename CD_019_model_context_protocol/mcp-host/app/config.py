"""Centralized configuration for server URLs.

You can override these by setting environment variables when starting the host container:
- ORDER_MANAGEMENT_SYSTEM_URL
- USER_PROFILE_URL

Defaults point to docker compose service hostnames used in this repo.
"""
import os

SERVER_URLS = {
    "order_management_system": os.getenv("ORDER_MANAGEMENT_SYSTEM_URL", "http://mcp-server-order-management-system:8080"),
    "user_profile": os.getenv("USER_PROFILE_URL", "http://mcp-server-user-profile:8080"),
}

def get_server_url(key: str) -> str:
    return SERVER_URLS[key]