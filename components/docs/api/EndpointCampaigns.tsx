"use client";

import React from "react";
import ApiEndpointDoc from "./ApiEndpointDoc";
import { Info, Banknote, Zap } from "lucide-react";

const campaignParameters = [
  {
    name: "title",
    type: "string",
    required: true,
    description: "The display title for the campaign. Minimum 5 characters, maximum 100.",
  },
  {
    name: "description",
    type: "string",
    required: true,
    description: "A detailed description of the campaign (20-5000 characters). Supports standard Markdown formatting.",
  },
  {
    name: "goal_amount",
    type: "number",
    required: true,
    description: "The target amount to be raised. Must be greater than 0.",
  },
  {
    name: "payout_mode",
    type: "string",
    required: true,
    description: "Frequency of settlement. Options: 'after_deadline' or 'immediate'.",
  },
  {
    name: "deadline",
    type: "string",
    required: false,
    description: "ISO 8601 datetime string. Required if payout_mode is 'after_deadline'.",
  },
  {
    name: "bank_account_number",
    type: "string",
    required: true,
    description: "The 10-digit NUBAN account number for settlement.",
  },
  {
    name: "bank_code",
    type: "string",
    required: true,
    description: "The 3-digit bank code (e.g., '058' for GTB).",
  },
  {
    name: "bank_account_name",
    type: "string",
    required: true,
    description: "The official legal name associated with the bank account.",
  },
];

const updateParameters = campaignParameters.map(p => ({ ...p, required: false }));
// Add status to update
updateParameters.push({
  name: "status",
  type: "string",
  required: false,
  description: "Manually set campaign status: 'active', 'paused', 'completed', or 'cancelled'.",
});

export function SectionCreateCampaign() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900">Create Campaign</h1>
        <p className="text-slate-500 text-lg">Initializes a new fundraising campaign with direct bank settlement.</p>
      </header>

      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex flex-col gap-6">
        <h3 className="font-bold text-[#0A2A5C] flex items-center gap-2">
          <Banknote className="w-5 h-5 text-blue-600" />
          Understanding Payout Modes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-5 bg-white rounded-2xl border border-blue-100/50 space-y-2">
             <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
                <Zap className="w-4 h-4" /> Immediate Settlement
             </div>
             <p className="text-slate-600 leading-relaxed">
                Funds are pushed to your bank account as soon as donations are verified. 
                Perfect for urgent needs like **medical emergencies** where liquidity is critical.
             </p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-blue-100/50 space-y-2">
             <div className="flex items-center gap-2 font-bold mb-2 text-indigo-600">
                <Info className="w-4 h-4" /> After Deadline
             </div>
             <p className="text-slate-600 leading-relaxed">
                Funds are held securely by RefreeG and settled in a single lump sum after the campaign deadline is reached. 
                Ideal for **project-based** or community goals.
             </p>
          </div>
        </div>
      </div>

      <ApiEndpointDoc
        title="Create Campaign"
        method="POST"
        url="/api/bot/campaigns"
        description="Creates a new campaign. API campaigns are immediately active and can start receiving donations."
        parameters={campaignParameters}
        requestExample={`{
  "title": "Hospital Recovery Fund",
  "description": "Patient needs immediate surgery.",
  "goal_amount": 250000,
  "payout_mode": "immediate",
  "bank_account_number": "0123456789",
  "bank_code": "058",
  "bank_account_name": "Jane Cooper"
}`}
        responseExample={`{
  "status": "success",
  "data": {
    "id": "c8b3ecf6-02e1-450f-96a8...",
    "status": "active",
    "raised_amount": 0
  }
}`}
      />
    </div>
  );
}

export function SectionUpdateCampaign() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900">Update Campaign</h1>
        <p className="text-slate-500 text-lg">Modifies an existing campaign. Only specified fields will be updated.</p>
      </header>

      <ApiEndpointDoc
        title="Update Campaign"
        method="PATCH"
        url="/api/bot/campaigns/[id]"
        description="Updates campaign details. Supports title, description, bank details, and status updates."
        parameters={updateParameters}
        requestExample={`{
  "title": "Optimized Recovery Fund",
  "bank_account_number": "9876543210",
  "status": "active"
}`}
        responseExample={`{
  "status": "success",
  "data": { "id": "uuid...", "title": "Optimized Recovery Fund", "status": "active" }
}`}
      />
    </div>
  );
}

export function SectionListCampaigns() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900">List Campaigns</h1>
        <p className="text-slate-500 text-lg">Retrieves a paginated list of all campaigns owned by your API key.</p>
      </header>

      <ApiEndpointDoc
        title="List Campaigns"
        method="GET"
        url="/api/bot/campaigns"
        description="Filter campaigns by status or category."
        parameters={[
          { name: "status", type: "string", required: false, description: "Filter by status: 'active', 'completed', 'paused', 'cancelled'." },
          { name: "category", type: "string", required: false, description: "Filter by category ID." },
          { name: "limit", type: "number", required: false, description: "Max results (default: 10, max: 100)." },
          { name: "offset", type: "number", required: false, description: "Pagination offset." },
        ]}
        responseExample={`{
  "status": "success",
  "data": [
    { "id": "c8b3ecf6...", "title": "Clean Water", "status": "active", "raised_amount": 54000 }
  ],
  "meta": { "total": 12, "limit": 10, "offset": 0 }
}`}
      />
    </div>
  );
}
