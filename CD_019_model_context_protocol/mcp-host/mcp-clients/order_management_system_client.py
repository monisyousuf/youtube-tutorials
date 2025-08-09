"""Orders specific client that wraps GenericMCPClient.

Provides a small, clear interface the host app can import and use:
- OrdersClient.initialize()
- OrdersClient.get_order_status(order_id)
"""
from generic_client import GenericMCPClient


class OrderManagementSystemClient:
    def __init__(self, base_url: str):
        self._client = GenericMCPClient(base_url)

    def initialize(self):
        return self._client.initialize()

    def get_order_status(self, order_id: str):
        return self._client.call_tool("get_order_status", {"order_id": order_id})


# Backwards-compatible runner
if __name__ == "__main__":
    # allow running as a quick test script; default url taken from config if available
    try:
        from ..config import get_server_url
        url = get_server_url("order_management_system")
    except Exception:
        url = "http://mcp-server-order-management-system:8080"
    client = OrderManagementSystemClient(url)
    print(client.initialize())