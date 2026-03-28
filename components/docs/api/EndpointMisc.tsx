"use client";

import React from "react";
import ApiEndpointDoc from "./ApiEndpointDoc";
import { Zap, Info } from "lucide-react";

export function SectionValidateAi() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-bold tracking-wider uppercase">
             <Zap className="w-3 h-3" /> AI Validation Gate
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">AI Blueprint Validation</h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            A specialized endpoint for AI agents to dry-run campaign payloads. Use this as your 
            **quality assurance gate** before calling the live create endpoint.
          </p>
        </header>

        <ApiEndpointDoc
          title="AI Blueprint Validation"
          method="POST"
          url="/api/bot/campaigns/validate"
          description="Analyzes a campaign payload against RefreeG's production constraints. It does NOT create a campaign in the database."
          parameters={[
            { name: "title", type: "string", required: true, description: "Proposed title." },
            { name: "description", type: "string", required: true, description: "Proposed description (min 20 chars)." },
            { name: "goal_amount", type: "number", required: true, description: "Target amount in NGN." },
            { name: "payout_mode", type: "string", required: true, description: "'manual' (on-demand) or 'automated' (at goal/deadline)." },
            { name: "bank_name", type: "string", required: true, description: "Recipient bank name." },
            { name: "account_number", type: "string", required: true, description: "10-digit NUBAN account number." },
            { name: "account_name", type: "string", required: true, description: "Legal account name." },
          ]}
          requestExample={`{
  "title": "Clean Water AI",
  "payout_mode": "manual",
  "goal_amount": 100000,
  "description": "Providing clean water to remote areas.",
  "bank_name": "Access Bank",
  "account_number": "0123456789",
  "account_name": "John Doe"
}`}
          responseExample={`{
  "status": "error",
  "errorCode": "VALIDATION_ERROR",
  "details": {
    "bank_account_number": { "_errors": ["Required"] },
    "description": { "_errors": ["Must be at least 20 characters"] }
  }
}`}
        />

        <div className="bg-[#0A2A5C] p-8 rounded-3xl border border-slate-800 shadow-2xl relative group">
          <div className="relative z-10 flex gap-5">
            <div className="p-3 bg-white/10 rounded-2xl h-fit">
              <Info className="w-6 h-6 text-blue-300" />
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-white text-lg">Agent Strategy: Self-Correction</h4>
              <p className="text-blue-100/70 leading-relaxed text-[15px]">
                When an AI agent receives an error from this endpoint, programmatically include the **details** 
                object in your next prompt to the LLM. 
                Example prompt: 
                <span className="block mt-4 bg-slate-950/50 p-4 rounded-xl border border-white/5 italic text-blue-200">
                  "The RefreeG API rejected the previous JSON because the description was too short. 
                  Below are the error details. Please strictly rewrite the JSON to satisfy these constraints: [ERROR_DETAILS]"
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionReportCampaign() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900">Moderation & Safety</h1>
        <p className="text-slate-500 text-lg">Programmatically report suspicious campaigns.</p>
      </header>
      <ApiEndpointDoc
        title="Report Campaign"
        method="POST"
        url="/api/bot/campaigns/[id]/reports"
        description="Flags a campaign for review. High-level reason and optional message."
        parameters={[
          { name: "reason", type: "string", required: true, description: "High-level reason for report (5-100 characters)." },
          { name: "message", type: "string", required: false, description: "Detailed explanation." },
        ]}
        requestExample={`{ "reason": "suspicious_activity", "message": "Link leads to a phishing site." }`}
        responseExample={`{ "status": "success", "data": { "report_id": "rep_123" } }`}
      />
    </div>
  );
}

export function SectionCategories() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900">Categories</h1>
        <p className="text-slate-500 text-lg">Query the list of active crowdfunding categories.</p>
      </header>
      <ApiEndpointDoc
        title="List Categories"
        method="GET"
        url="/api/bot/campaigns/categories"
        description="Retrieves category names and IDs for UI display."
        responseExample={`{ "status": "success", "data": [{ "id": "medical", "display_name": "Health" }] }`}
      />
    </div>
  );
}
