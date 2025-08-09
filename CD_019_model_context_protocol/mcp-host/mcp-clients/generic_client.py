"""Generic MCP JSON-RPC client utilities.

Provides:
- JSON-RPC request construction and POST handling
- initialize() convenience method
- call_tool(tool_name, parameters) to invoke MCP tools (tools/call)
- read_resource(resource_name, parameters) to invoke resources/read

"""
import requests
import uuid
import json


class GenericMCPClient:
    def __init__(self, base_url, timeout: int = 10):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def _post(self, payload: dict) -> dict:
        headers = {"Content-Type": "application/json"}
        url = f"{self.base_url}/"
        resp = requests.post(url, json=payload, headers=headers, timeout=self.timeout)
        resp.raise_for_status()
        return resp.json()

    def call_method(self, method: str, params: dict | None = None) -> dict:
        payload = {
            "jsonrpc": "2.0",
            "id": str(uuid.uuid4()),
            "method": method,
        }
        if params is not None:
            payload["params"] = params
        return self._post(payload)

    def initialize(self) -> dict:
        """Send an initialize JSON-RPC call. Returns the parsed JSON response."""
        return self.call_method("initialize", {"protocolVersion": "2024-02-01"})

    def call_tool(self, tool_name: str, parameters: dict | None = None) -> dict:
        """Invoke a tool via the standard MCP 'tools/call' method.

        Returns the server's JSON-RPC response as a dict.
        """
        params = {"tool": tool_name, "parameters": parameters or {}}
        return self.call_method("tools/call", params)

    def read_resource(self, resource_name: str, parameters: dict | None = None) -> dict:
        """Invoke a resource read via the standard MCP 'resources/read' method."""
        params = {"resource": resource_name, "parameters": parameters or {}}
        return self.call_method("resources/read", params)