"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  LayoutDashboard,
  Key,
  ChevronRight,
  ExternalLink,
  Info,
  Terminal,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ApiSidebar from "@/components/docs/ApiSidebar";
import ApiEndpointDoc from "@/components/docs/ApiEndpointDoc";
import ApiPlayground from "@/components/docs/ApiPlayground";

export default function ApiDocsPage() {
  const [sidebarSelection, setSidebarSelection] = useState("Introduction");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full bg-white min-h-screen text-slate-900 selection:bg-blue-100 italic-none">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/docs/get-started"
              className="flex items-center gap-2 group"
            >
              <div className="rounded-lg text-white transition-colors">
                <Image
                  src="/logo.svg"
                  width={24}
                  height={24}
                  alt="RefreeG"
                  className="w-6 h-6"
                />
              </div>
              <span className="font-bold text-[18px] tracking-tight">
                RefreeG <span className="text-blue-600">Dev</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-2 text-slate-300 mx-2">
              <ChevronRight className="w-4 h-4" />
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/docs/api"
                className="text-sm font-bold text-[#0A2A5C] border-b-2 border-[#0A2A5C] h-16 flex items-center mt-0.5"
              >
                API Reference
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block mr-4">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search API documentation…"
                className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>
            <Link
              href="/dashboard/developer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/developer/api-keys"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0A2A5C] text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-blue-900/10"
            >
              <Key className="w-4 h-4" />
              Get API Keys
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] flex flex-col md:flex-row gap-10 px-4 md:px-6 pt-10">
        <ApiSidebar
          selected={sidebarSelection}
          onSelect={setSidebarSelection}
        />

        {/* Mobile View Placeholder for Sidebar triggers would go here if needed */}

        <main className="flex-1 min-w-0 pb-20">
          {/* Main Content Area */}
          <div className="max-w-4xl">
            {sidebarSelection === "Introduction" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                    RefreeG API Documentation
                  </h1>
                  <p className="text-xl text-slate-500 leading-relaxed font-medium">
                    Build professional, transparent, and high-impact
                    crowdfunding experiences into your apps using the RefreeG
                    Dev API.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-slate-100 rounded-2xl bg-white shadow-sm shadow-slate-100 group hover:border-blue-200 transition-all cursor-pointer">
                    <div className="bg-blue-50 p-3 rounded-xl w-fit mb-4 group-hover:bg-blue-100 transition-colors">
                      <Terminal className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">
                      RESTful Architecture
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Our API is built on standard REST patterns, utilizing
                      predictable URLs and standard HTTP response codes.
                    </p>
                  </div>
                  <div className="p-6 border border-slate-100 rounded-2xl bg-white shadow-sm shadow-slate-100 group hover:border-green-200 transition-all cursor-pointer">
                    <div className="bg-green-50 p-3 rounded-xl w-fit mb-4 group-hover:bg-green-100 transition-colors">
                      <ShieldCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">
                      Sandbox Environment
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Every account includes a full sandbox environment. Test
                      your full payment flow without spending a dime.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-1">
                      <Info className="w-5 h-5" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900">
                        A Note for Bot & App Developers
                      </h4>
                      <p className="text-slate-600 leading-relaxed text-[15px]">
                        The RefreeG API is designed for **developers** building
                        external clients. Unlike the platform, campaigns created
                        via the API are **immediately active** and are **not
                        hosted on refreeg.com**. You are responsible for your
                        own user interface and campaign discovery.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sidebarSelection === "Authentication" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <header className="space-y-4">
                  <h1 className="text-3xl font-extrabold text-slate-900 font-sans">
                    Authentication
                  </h1>
                  <p className="text-slate-500 text-lg">
                    Secure your requests using Secret API Keys.
                  </p>
                </header>

                <section className="space-y-6">
                  <p className="text-slate-600 leading-relaxed font-sans">
                    RefreeG uses API keys to authenticate requests. You can view
                    and manage your API keys in the{" "}
                    <Link
                      href="/dashboard/developer/api-keys"
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Developer Dashboard
                    </Link>
                    .
                  </p>

                  <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800">
                    <h4 className="text-slate-400 text-[12px] uppercase font-bold mb-4 tracking-widest">
                      Header Example
                    </h4>
                    <code className="text-blue-300 font-mono text-[14px]">
                      Authorization: Bearer rg_test_sk_abc123...
                    </code>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-bold text-slate-900">
                      Key Types
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 border border-slate-100 rounded-xl bg-slate-50/50">
                        <span className="text-[11px] font-bold uppercase text-orange-600 bg-orange-50 px-2 py-1 rounded-md mb-2 inline-block">
                          Sandbox
                        </span>
                        <h4 className="font-bold text-slate-900 mb-1">
                          Test Secret Key
                        </h4>
                        <p className="text-[13px] text-slate-500">
                          Starts with{" "}
                          <code className="text-slate-800 font-mono">
                            rg_test_sk_
                          </code>
                          . Use for development.
                        </p>
                      </div>
                      <div className="p-5 border border-slate-100 rounded-xl bg-slate-50/50">
                        <span className="text-[11px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
                          Production
                        </span>
                        <h4 className="font-bold text-slate-900 mb-1">
                          Live Secret Key
                        </h4>
                        <p className="text-[13px] text-slate-500">
                          Starts with{" "}
                          <code className="text-slate-800 font-mono">
                            rg_live_sk_
                          </code>
                          . Use for real payments. **Keep secret.**
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {sidebarSelection === "Quickstart" && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <header className="space-y-4">
                  <h1 className="text-3xl font-extrabold text-slate-900">
                    Developer Quickstart
                  </h1>
                  <p className="text-slate-500 text-lg">
                    Launch your first campaign and accept donations in 5
                    minutes.
                  </p>
                </header>

                <div className="space-y-12">
                  {[
                    {
                      step: "01",
                      title: "Generate API Keys",
                      content:
                        "Sign up at RefreeG and heading to the Developer Dashboard. Create a new set of keys and copy your **Test Secret Key**.",
                      link: "/dashboard/developer/api-keys",
                      linkText: "Go to Keys →",
                    },
                    {
                      step: "02",
                      title: "Create a Campaign",
                      content:
                        "Deploy a campaign immediately. No manual review needed for development keys.",
                      code: `curl -X POST https://api.refreeg.com/api/bot/campaigns \\
  -H "Authorization: Bearer YOUR_TEST_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Clean Water Project",
    "goal_amount": 1000000,
    "category": "environment",
    "bank_account": {
       "account_number": "0000000000",
       "bank_code": "058",
       "account_name": "Project Fund"
    }
  }'`,
                    },
                    {
                      step: "03",
                      title: "Send a Donation",
                      content:
                        "Use the donation initialization endpoint to get a secure checkout link.",
                      code: `curl -X POST https://api.refreeg.com/api/bot/donations/initialize \\
  -H "Authorization: Bearer YOUR_TEST_KEY" \\
  -d '{
    "campaign_id": "CAMPAIGN_UUID",
    "amount": 5000,
    "email": "donor@example.com"
  }'`,
                    },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-6 relative">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
                        {s.step}
                      </div>
                      <div className="flex-1 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">
                          {s.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed font-sans">
                          {s.content}
                        </p>
                        {s.link && (
                          <Link
                            href={s.link}
                            className="inline-block text-blue-600 font-bold hover:underline"
                          >
                            {s.linkText}
                          </Link>
                        )}
                        {s.code && (
                          <div className="bg-slate-900 rounded-2xl p-6 overflow-x-auto shadow-lg">
                            <pre className="text-blue-300 text-sm font-mono leading-relaxed">
                              <code>{s.code}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sidebarSelection === "Create Campaign" && (
              <ApiEndpointDoc
                method="POST"
                url="/api/bot/campaigns"
                description="Creates a new campaign. API campaigns are immediately active and can start receiving donations. They do not appear on the main RefreeG website."
                parameters={[
                  {
                    name: "title",
                    type: "string",
                    required: true,
                    description:
                      "Display title for the campaign (max 200 chars).",
                  },
                  {
                    name: "goal_amount",
                    type: "number",
                    required: true,
                    description: "Target amount in Base Currency (NGN/GHS).",
                  },
                  {
                    name: "category",
                    type: "string",
                    required: true,
                    description:
                      "ID of the category (e.g., 'health', 'education').",
                  },
                  {
                    name: "description",
                    type: "string",
                    required: false,
                    description: "Full markdown-supported description.",
                  },
                  {
                    name: "summary",
                    type: "string",
                    required: false,
                    description: "Short intro text (max 500 chars).",
                  },
                  {
                    name: "bank_account",
                    type: "object",
                    required: true,
                    description:
                      "Beneficiary bank details (account_number, bank_code, account_name).",
                  },
                  {
                    name: "deadline",
                    type: "string",
                    required: false,
                    description: "ISO 8601 date string for campaign closure.",
                  },
                  {
                    name: "payout_mode",
                    type: "string",
                    required: false,
                    description:
                      "Defaults to 'after_deadline'. Can be 'immediate'.",
                  },
                ]}
                requestExample={`{
  "title": "Hospital Recovery Fund",
  "goal_amount": 250000,
  "category": "health",
  "bank_account": {
    "account_number": "0123456789",
    "bank_code": "058",
    "account_name": "Jane Cooper"
  }
}`}
                responseExample={`{
  "status": "success",
  "data": {
    "id": "c8b3ecf6-02e1-450f-96a8...",
    "title": "Hospital Recovery Fund",
    "status": "active",
    "raised_amount": 0,
    "created_at": "2026-03-25T10:00:00Z"
  }
}`}
              />
            )}

            {sidebarSelection === "List Campaigns" && (
              <ApiEndpointDoc
                method="GET"
                url="/api/bot/campaigns"
                description="Retrieves a list of campaigns owned by your API key. Filter by status or category."
                parameters={[
                  {
                    name: "status",
                    type: "string",
                    required: false,
                    description:
                      "Filter by status: 'active', 'completed', 'paused', 'cancelled'.",
                  },
                  {
                    name: "category",
                    type: "string",
                    required: false,
                    description: "Filter by category ID.",
                  },
                  {
                    name: "limit",
                    type: "number",
                    required: false,
                    description: "Max results (default: 10, max: 100).",
                  },
                  {
                    name: "offset",
                    type: "number",
                    required: false,
                    description: "Pagination offset.",
                  },
                ]}
                responseExample={`{
  "status": "success",
  "data": [
    {
      "id": "c8b3ecf6...",
      "title": "Clean Water",
      "status": "active",
      "raised_amount": 54000,
      "goal_amount": 1000000
    }
  ],
  "meta": {
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}`}
              />
            )}

            {sidebarSelection === "Update Campaign" && (
              <ApiEndpointDoc
                method="PATCH"
                url="/api/bot/campaigns/[id]"
                description="Updates an existing campaign's details. Only fields provided in the body will be updated."
                parameters={[
                  {
                    name: "title",
                    type: "string",
                    required: false,
                    description: "New title for the campaign.",
                  },
                  {
                    name: "description",
                    type: "string",
                    required: false,
                    description: "Updated description (markdown).",
                  },
                  {
                    name: "goal_amount",
                    type: "number",
                    required: false,
                    description: "New target goal.",
                  },
                  {
                    name: "status",
                    type: "string",
                    required: false,
                    description:
                      "Change status: 'active', 'paused', 'cancelled'.",
                  },
                ]}
                requestExample={`{
  "title": "Updated Fund Name",
  "status": "active"
}`}
                responseExample={`{
  "status": "success",
  "data": { "id": "uuid...", "title": "Updated Fund Name", "status": "active" }
}`}
              />
            )}

            {sidebarSelection === "Report Campaign" && (
              <ApiEndpointDoc
                method="POST"
                url="/api/bot/campaigns/[id]/reports"
                description="Flags a campaign for review by the RefreeG moderation team. Use this if you suspect fraud or policy violations."
                parameters={[
                  {
                    name: "reason",
                    type: "string",
                    required: true,
                    description: "Brief reason for the report (max 200 chars).",
                  },
                  {
                    name: "message",
                    type: "string",
                    required: false,
                    description: "Detailed explanation or evidence.",
                  },
                ]}
                requestExample={`{
  "reason": "suspicious_activity",
  "message": "The beneficiary details do not match the campaign description."
}`}
                responseExample={`{
  "status": "success",
  "data": {
    "report_id": "rep_789...",
    "message": "Campaign reported. Our safety team will investigate."
  }
}`}
              />
            )}

            {sidebarSelection === "List Categories" && (
              <ApiEndpointDoc
                method="GET"
                url="/api/bot/campaigns/categories"
                description="Retrieves a list of all available campaign categories and their IDs."
                responseExample={`{
  "status": "success",
  "data": [
    { "id": "education", "name": "Education" },
    { "id": "health", "name": "Health & Medical" }
  ]
}`}
              />
            )}

            {sidebarSelection === "Validate Campaign" && (
              <ApiEndpointDoc
                method="POST"
                url="/api/bot/campaigns/validate"
                description="Validates a campaign object without creating it. Extremely useful for verifying AI-generated content before final submission."
                parameters={[
                  {
                    name: "title",
                    type: "string",
                    required: true,
                    description: "The title to validate.",
                  },
                  {
                    name: "goal_amount",
                    type: "number",
                    required: true,
                    description: "The goal amount to validate.",
                  },
                  {
                    name: "bank_account",
                    type: "object",
                    required: true,
                    description: "The bank details to validate.",
                  },
                ]}
                requestExample={`{
  "title": "",
  "goal_amount": -100
}`}
                responseExample={`{
  "status": "error",
  "error": {
    "code": "validation_error",
    "details": [
      { "field": "title", "message": "String must contain at least 5 character(s)" },
      { "field": "goal_amount", "message": "Number must be greater than 0" }
    ]
  }
}`}
              />
            )}

            {sidebarSelection === "Initialize Donation" && (
              <ApiEndpointDoc
                method="POST"
                url="/api/bot/donations/initialize"
                description="Starts the payment process. Returns a secure authorization_url from Paystack that your users must visit to complete the donation."
                parameters={[
                  {
                    name: "campaign_id",
                    type: "string",
                    required: true,
                    description: "UUID of the target campaign.",
                  },
                  {
                    name: "amount",
                    type: "number",
                    required: true,
                    description: "Amount to donate in Base Currency.",
                  },
                  {
                    name: "email",
                    type: "string",
                    required: true,
                    description: "Donor's contact email for receipts.",
                  },
                  {
                    name: "name",
                    type: "string",
                    required: false,
                    description: "Donor's display name.",
                  },
                  {
                    name: "message",
                    type: "string",
                    required: false,
                    description: "Optional message for the campaign wall.",
                  },
                  {
                    name: "is_anonymous",
                    type: "boolean",
                    required: false,
                    description: "If true, name is hidden from public logs.",
                  },
                  {
                    name: "tip_amount",
                    type: "number",
                    required: false,
                    description: "Optional tip for the RefreeG platform.",
                  },
                  {
                    name: "callback_url",
                    type: "string",
                    required: false,
                    description: "URL to redirect back to after payment.",
                  },
                ]}
                requestExample={`{
  "campaign_id": "c8b3ecf6...",
  "amount": 10000,
  "email": "donor@example.com",
  "name": "Alex Donor",
  "callback_url": "https://myapp.com/success"
}`}
                responseExample={`{
  "status": "success",
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "reference": "rf_123xyz...",
    "access_code": "ac_abc789"
  }
}`}
              />
            )}

            {sidebarSelection === "Verify Donation" && (
              <ApiEndpointDoc
                method="GET"
                url="/api/bot/donations/verify/[reference]"
                description="Confirms that a payment has been successfully processed. Call this after the user redirects back via the callback_url."
                responseExample={`{
  "status": "success",
  "data": {
    "verified": true,
    "donation": {
      "id": "uuid-123",
      "amount": 10000,
      "status": "completed",
      "reference": "rf_123xyz...",
      "created_at": "2026-03-25T14:30:00Z"
    }
  }
}`}
              />
            )}

            {sidebarSelection === "Webhook Registration" && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <header className="space-y-4">
                  <h1 className="text-3xl font-extrabold text-slate-900">
                    Webhook Management
                  </h1>
                  <p className="text-slate-500 text-lg">
                    Subscribe to real-time campaign and donation events.
                  </p>
                </header>

                <ApiEndpointDoc
                  method="POST"
                  url="/api/bot/webhooks"
                  description="Registers a new URL to receive webhook notifications. RefreeG will POST JSON payloads to this URL."
                  parameters={[
                    {
                      name: "url",
                      type: "string",
                      required: true,
                      description:
                        "Publicly accessible URL to receive POST requests.",
                    },
                    {
                      name: "events",
                      type: "string[]",
                      required: true,
                      description:
                        "Array of events (e.g., ['donation.completed']).",
                    },
                  ]}
                  requestExample={`{
  "url": "https://api.myapp.com/hooks/refreeg",
  "events": ["campaign.created", "donation.completed"]
}`}
                  responseExample={`{
  "status": "success",
  "data": {
    "id": "hook_123...",
    "url": "https://api.myapp.com/hooks/refreeg",
    "secret": "wh_sec_xyz...",
    "message": "Webhook registered. Use the secret to verify HMAC signatures."
  }
}`}
                />
              </div>
            )}

            {sidebarSelection === "Webhook Security" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <header className="space-y-4">
                  <h1 className="text-3xl font-extrabold text-slate-900 font-sans">
                    Verification Logic
                  </h1>
                  <p className="text-slate-500 text-lg">
                    Protect your endpoints by verifying the X-RefreeG-Signature.
                  </p>
                </header>

                <section className="space-y-6">
                  <p className="text-slate-600 leading-relaxed max-w-2xl">
                    Every webhook request includes an{" "}
                    <code className="text-blue-600 font-bold">
                      X-RefreeG-Signature
                    </code>{" "}
                    header. This is an HMAC-SHA256 hash of the raw JSON body,
                    signed using your Webhook Secret.
                  </p>

                  <div className="space-y-3">
                    <h4 className="text-[12px] font-bold uppercase text-slate-400">
                      Node.js / Express Example
                    </h4>
                    <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-2xl">
                      <pre className="text-blue-300 font-mono text-sm leading-relaxed overflow-x-auto">
                        <code>{`const crypto = require('crypto');

app.post('/webhook', (req, res) => {
  const secret = process.env.REFREEG_WEBHOOK_SECRET;
  const signature = req.headers['x-refreeg-signature'];
  
  const hmac = crypto.createHmac('sha256', secret);
  const hash = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  
  if (hash === signature) {
    // Authenticated! Proceed with processing.
    const event = req.body;
    console.log('Received:', event.event_type);
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});`}</code>
                      </pre>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {sidebarSelection === "API Playground" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">
                      API Playground
                    </h1>
                    <p className="text-slate-500 font-medium">
                      Test real API endpoints directly from your browser.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/developer/api-keys"
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    Get Sandbox Key <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-1 border border-slate-100 rounded-3xl bg-slate-50 shadow-inner">
                  <ApiPlayground />
                </div>
                <div className="mt-8 flex items-start gap-4 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                  <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
                  <p className="text-sm text-orange-800 leading-relaxed font-medium">
                    **Warning:** The playground uses real API endpoints. Ensure
                    you use **Secret Test Keys** to avoid processing real
                    transactions. Test campaigns will be stored in your
                    dashboard.
                  </p>
                </div>
              </div>
            )}

            {sidebarSelection === "SDKs" && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <header className="space-y-4">
                  <h1 className="text-3xl font-extrabold text-slate-900 font-sans">
                    SDKs & Libraries
                  </h1>
                  <p className="text-slate-500 text-lg">
                    Official libraries to accelerate your integration.
                  </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 border border-slate-100 shadow-sm rounded-3xl bg-white space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-50 rounded-2xl">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg"
                          className="w-8 h-8 opacity-70"
                          alt="Node.js"
                        />
                      </div>
                      <h3 className="text-xl font-bold">
                        JavaScript / Node.js
                      </h3>
                    </div>
                    <code className="block bg-slate-900 text-blue-300 p-4 rounded-xl text-sm font-mono">
                      npm install refreeg-sdk
                    </code>
                    <pre className="text-slate-400 font-mono text-[12px] leading-relaxed">
                      {`const { RefreeG } = require('refreeg-sdk');
const client = new RefreeG('your_secret_key');

// Create campaign
const campaign = await client.campaigns.create({
  title: 'My Cause',
  ...
});`}
                    </pre>
                  </div>

                  <div className="p-8 border border-slate-100 shadow-sm rounded-3xl bg-white space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-2xl">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg"
                          className="w-7 h-7 opacity-70"
                          alt="Python"
                        />
                      </div>
                      <h3 className="text-xl font-bold">Python</h3>
                    </div>
                    <code className="block bg-slate-900 text-blue-300 p-4 rounded-xl text-sm font-mono">
                      pip install refreeg
                    </code>
                    <pre className="text-slate-400 font-mono text-[12px] leading-relaxed">
                      {`from refreeg import Client

client = Client(api_key="your_secret_key")

# List campaigns
campaigns = client.campaigns.list(status="active")`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {sidebarSelection === "Errors" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <header className="space-y-4">
                  <h1 className="text-3xl font-extrabold text-slate-900 font-sans text-[34px]">
                    Error Reference
                  </h1>
                  <p className="text-slate-500 text-lg">
                    Common error codes and their meanings.
                  </p>
                </header>

                <div className="border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-sm font-bold text-slate-600">
                          Error Code
                        </th>
                        <th className="px-6 py-4 text-sm font-bold text-slate-600">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        {
                          code: "invalid_api_key",
                          msg: "The API key provided is invalid or has been revoked.",
                        },
                        {
                          code: "rate_limit_exceeded",
                          msg: "You have exceeded the request threshold for your current plan.",
                        },
                        {
                          code: "validation_error",
                          msg: "The request body failed schema validation. Check the details array.",
                        },
                        {
                          code: "campaign_not_found",
                          msg: "The requested campaign UUID does not exist.",
                        },
                        {
                          code: "insufficient_fields",
                          msg: "One or more required fields are missing from the request.",
                        },
                        {
                          code: "payment_initialization_failed",
                          msg: "Paystack was unable to initialize the donation.",
                        },
                      ].map((e) => (
                        <tr key={e.code}>
                          <td className="px-6 py-5">
                            <code className="bg-red-50 text-red-600 px-2 py-1 rounded text-[13px] font-bold font-mono">
                              {e.code}
                            </code>
                          </td>
                          <td className="px-6 py-5 text-slate-600 text-sm font-medium leading-relaxed">
                            {e.msg}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-lg">Documentation Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 bg-slate-50 rounded-lg text-slate-500"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100vh-100px)]">
              <ApiSidebar
                selected={sidebarSelection}
                onSelect={(id) => {
                  setSidebarSelection(id);
                  setMobileOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
