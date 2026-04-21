# refreeg-python

Python SDK for the RefreeG crowdfunding API.

## Usage

```python
from refreeg_python import RefreeG

client = RefreeG("rg_live_sk_...")

campaign = client.campaigns.create(
    {
        "title": "Flood relief",
        "description": "Emergency response support",
        "goal_amount": 500000,
        "payout_mode": "immediate",
        "bank_account_number": "0123456789",
        "bank_code": "058",
        "bank_account_name": "RefreeG Relief",
    }
)

payment = client.initialize_donation(
    {
        "campaign_id": campaign["id"],
        "amount": 10000,
        "name": "Ada",
        "email": "ada@example.com",
    }
)
```