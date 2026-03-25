# refreeg-js

Lightweight JavaScript client for the RefreeG crowdfunding API.

## Usage

```js
import RefreeG from "refreeg-js";

const refreeg = new RefreeG("rg_live_sk_...");

const campaign = await refreeg.campaigns.create({
  title: "School renovation",
  description: "Raise funds for classroom repairs.",
  goal_amount: 500000,
  payout_mode: "immediate",
  bank_account_number: "0123456789",
  bank_code: "058",
  bank_account_name: "Community Fund",
});

const payment = await refreeg.donations.initialize({
  campaign_id: campaign.id,
  amount: 10000,
  name: "Ada",
  email: "ada@example.com",
});
```