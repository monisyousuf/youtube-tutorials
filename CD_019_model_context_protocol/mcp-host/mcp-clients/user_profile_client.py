"""User-profile specific client that wraps GenericMCPClient.

Provides:
- UserProfileClient.initialize()
- UserProfileClient.get_user_profile(user_id)
"""
from generic_client import GenericMCPClient


class UserProfileClient:
    def __init__(self, base_url: str):
        self._client = GenericMCPClient(base_url)

    def initialize(self):
        return self._client.initialize()

    def get_user_profile(self, user_id: str):
        return self._client.call_tool("get_user_profile", {"user_id": user_id})


# Backwards-compatible runner
if __name__ == "__main__":
    try:
        from ..config import get_server_url
        url = get_server_url("user_profile")
    except Exception:
        url = "http://mcp-server-user-profile:8080"
    client = UserProfileClient(url)
    print(client.initialize())