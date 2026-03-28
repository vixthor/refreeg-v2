"use client";

import React from "react";
import ApiEndpointDoc from "./ApiEndpointDoc";

export function SectionDonations() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-8">
        <header className="space-y-4">
          <h1 className="text-3xl font-extrabold text-slate-900">Process Donations</h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Securely accept payments for any campaign via our integrated payment gateways.
          </p>
        </header>

        <ApiEndpointDoc
          title="Initialize Donation"
          method="POST"
          url="/api/bot/donations/initialize"
          description="Initiates a donation process. Returns a secure checkout URL for the donor."
          parameters={[
            { name: "campaign_id", type: "uuid", required: true, description: "External ID of the campaign." },
            { name: "amount", type: "number", required: true, description: "Donation amount in the campaign's native currency." },
            { name: "name", type: "string", required: true, description: "Donor display name." },
            { name: "email", type: "string", required: true, description: "Donor email address." },
            { name: "message", type: "string", required: false, description: "Personal message (optional)." },
            { name: "is_anonymous", type: "boolean", required: false, description: "Whether to hide donor name publicly." },
            { name: "callback_url", type: "string", required: false, description: "Where to redirect the user after payment." },
          ]}
          requestExample={`{
  "campaign_id": "c8b3ecf6-02e1-450f...",
  "amount": 10000,
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "callback_url": "https://myapp.com/success"
}`}
          responseExample={`{
  "status": "success",
  "data": {
    "reference": "ref_don_123...",
    "checkout_url": "https://paystack.com/checkout/f4g5...",
    "amount": 10000
  }
}`}
        />

        <ApiEndpointDoc
           title="Verify Donation"
          method="GET"
          url="/api/bot/donations/verify/[reference]"
          description="Verifies the outcome of a donation attempt using the unique transaction reference."
          responseExample={`{
  "status": "success",
  "data": {
    "id": "don_987...",
    "status": "success",
    "amount": 10000,
    "paid_at": "2026-03-25T11:00:00Z"
  }
}`}
        />
      </div>
    </div>
  );
}
