import requests
import json
from urllib.parse import urlencode

class RefreegError(Exception):
    pass

class Refreeg:
    def __init__(self, api_key: str, base_url: str = "https://refreeg.com/api/bot"):
        if not api_key:
            raise ValueError("RefreeG API key is required")
        self.api_key = api_key
        self.base_url = base_url

    def _fetch_api(self, endpoint: str, method: str = "GET", data=None, params=None):
        url = f"{self.base_url}{endpoint}"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        response = requests.request(method, url, headers=headers, json=data, params=params)
        
        try:
            body = response.json()
        except ValueError:
            raise RefreegError(f"Invalid JSON response: {response.text}")
        
        if not response.ok:
            message = body.get("message", f"HTTP Error {response.status_code}")
            raise RefreegError(f"RefreeG API Error: {message}")
            
        return body.get("data", body)

    @property
    def campaigns(self):
        class CampaignsClient:
            def __init__(self, client):
                self._client = client

            def create(self, payload: dict):
                return self._client._fetch_api("/campaigns", method="POST", data=payload)

            def get(self, campaign_id: str):
                return self._client._fetch_api(f"/campaigns/{campaign_id}")

            def list(self, query: dict = None):
                return self._client._fetch_api("/campaigns", params=query)

            def update(self, campaign_id: str, payload: dict):
                return self._client._fetch_api(f"/campaigns/{campaign_id}", method="PATCH", data=payload)

            def cancel(self, campaign_id: str):
                return self._client._fetch_api(f"/campaigns/{campaign_id}", method="DELETE")

            def pause(self, campaign_id: str):
                return self._client._fetch_api(f"/campaigns/{campaign_id}/pause", method="POST")

            def resume(self, campaign_id: str):
                return self._client._fetch_api(f"/campaigns/{campaign_id}/resume", method="POST")

            def donations(self, campaign_id: str):
                return self._client._fetch_api(f"/campaigns/{campaign_id}/donations")

        return CampaignsClient(self)

    @property
    def donations(self):
        class DonationsClient:
            def __init__(self, client):
                self._client = client

            def initialize(self, payload: dict):
                return self._client._fetch_api("/donations/initialize", method="POST", data=payload)

            def verify(self, reference: str):
                return self._client._fetch_api(f"/donations/verify/{reference}")

            def get(self, donation_id: str):
                return self._client._fetch_api(f"/donations/{donation_id}")

        return DonationsClient(self)

    @property
    def webhooks(self):
        class WebhooksClient:
            def __init__(self, client):
                self._client = client

            def register(self, payload: dict):
                return self._client._fetch_api("/webhooks", method="POST", data=payload)

            def list(self):
                return self._client._fetch_api("/webhooks")

            def update(self, webhook_id: str, payload: dict):
                return self._client._fetch_api(f"/webhooks/{webhook_id}", method="PATCH", data=payload)

            def delete(self, webhook_id: str):
                return self._client._fetch_api(f"/webhooks/{webhook_id}", method="DELETE")

        return WebhooksClient(self)

    @property
    def banks(self):
        class BanksClient:
            def __init__(self, client):
                self._client = client

            def register(self, payload: dict):
                return self._client._fetch_api("/banks", method="POST", data=payload)

            def list(self):
                return self._client._fetch_api("/banks")

        return BanksClient(self)
