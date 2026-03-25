from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional

import requests


DEFAULT_BASE_URL = "https://refreeg.com/api/bot"


@dataclass
class _Resource:
    client: "RefreeG"
    base_path: str

    def create(self, payload: Dict[str, Any]) -> Any:
        return self.client.request(self.base_path, method="POST", json=payload)

    def list(self, params: Optional[Dict[str, Any]] = None) -> Any:
        return self.client.request(self.base_path, method="GET", params=params)

    def retrieve(self, resource_id: str) -> Any:
        return self.client.request(f"{self.base_path}/{resource_id}", method="GET")

    def update(self, resource_id: str, payload: Dict[str, Any]) -> Any:
        return self.client.request(
            f"{self.base_path}/{resource_id}", method="PATCH", json=payload
        )


class RefreeG:
    def __init__(self, api_key: str, base_url: str = DEFAULT_BASE_URL, timeout: int = 30):
        if not api_key:
            raise ValueError("A RefreeG API key is required")

        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
        )

        self.campaigns = _Resource(self, "/campaigns")
        self.webhooks = _Resource(self, "/webhooks")

    def request(self, path: str, method: str = "GET", **kwargs: Any) -> Any:
        response = self.session.request(
            method=method,
            url=f"{self.base_url}{path}",
            timeout=self.timeout,
            **kwargs,
        )
        payload = response.json()

        if not response.ok:
          message = payload.get("error", {}).get("message") if isinstance(payload.get("error"), dict) else payload.get("error", "RefreeG API request failed")
          raise RuntimeError(message)

        return payload.get("data", payload)

    def initialize_donation(self, payload: Dict[str, Any]) -> Any:
        return self.request("/donations/initialize", method="POST", json=payload)

    def verify_donation(self, reference: str) -> Any:
        return self.request(f"/donations/verify/{reference}", method="GET")