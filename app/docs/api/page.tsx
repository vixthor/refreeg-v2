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
  X,
  Zap,
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

      {/* Mobile Navigation Trigger */}
      <div className="md:hidden sticky top-[73px] z-40 w-full bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 text-slate-600 font-bold text-sm"
        >
          <Menu className="w-5 h-5" />
          {sidebarSelection}
        </button>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
           <span className="text-[11px] font-bold text-slate-400 tracking-wider">API READY</span>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <span className="font-extrabold text-blue-600 tracking-tight">API NAV</span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-2">
              <ApiSidebar 
                selected={sidebarSelection} 
                onSelect={(id) => {
                  setSidebarSelection(id);
                  setMobileOpen(false);
                }} 
                className="mt-4"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1500px] flex flex-col md:flex-row gap-10 px-4 md:px-6 pt-10 pb-20">
        <div className="hidden md:block shrink-0 w-72 min-w-[280px]">
          <ApiSidebar
            selected={sidebarSelection}
            onSelect={setSidebarSelection}
            className="sticky top-20 h-[calc(100vh-10rem)]"
          />
        </div>

        {/* Mobile View Placeholder for Sidebar triggers would go here if needed */}

        <main className="flex-1 min-w-0 pb-20">
          {/* Main Content Area */}
          <div className={sidebarSelection === "API Playground" ? "max-w-full" : "max-w-4xl"}>
            {sidebarSelection === "Introduction" && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                    RefreeG Developer API
                  </h1>
                  <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-2xl">
                    Programmatically launch campaigns, manage donors, and scale social impact using our production-grade API infrastructure.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "RESTful JSON", icon: <Terminal className="w-5 h-5 text-blue-600" />, desc: "Predictable resource-oriented URLs and full JSON bodies.", bg: "bg-blue-50" },
                    { title: "Deterministic", icon: <ShieldCheck className="w-5 h-5 text-green-600" />, desc: "Standard HTTP codes and unambiguous response objects.", bg: "bg-green-50" },
                    { title: "Multi-Region", icon: <Info className="w-5 h-5 text-orange-600" />, desc: "Native support for NGN, GHS, and other emerging markets.", bg: "bg-orange-50" },
                  ].map((feat) => (
                    <div key={feat.title} className="p-6 border border-slate-100 rounded-2xl bg-white hover:border-blue-200 transition-all shadow-sm">
                      <div className={`${feat.bg} p-2.5 rounded-xl w-fit mb-4`}>
                        {feat.icon}
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1">{feat.title}</h3>
                      <p className="text-slate-500 text-[13px] leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-8 pt-6">
                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4">Core Concepts</h2>
                    <p className="text-slate-600 leading-relaxed max-w-3xl">
                      The RefreeG API is designed for robustness. Whether you're building a Discord bot, a mobile application, or any 
                      third-party interface, our API provides the hooks you need to manage the complete donor lifecycle.
                    </p>
                  </section>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-900">Standard Response Format</h3>
                      <p className="text-sm text-slate-500">Every response follows a deterministic structure, making integration across languages seamless.</p>
                      <div className="bg-slate-900 rounded-2xl p-6 shadow-xl overflow-x-auto">
                        <pre className="text-blue-300 font-mono text-[13px]">
{`{
  "status": "success",
  "data": { ... },
  "meta": { "total": 100 } // Optional
}`}
                        </pre>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-900">Rate Limiting</h3>
                      <p className="text-sm text-slate-500">We enforce limits to preserve quality of service. Current global defaults for production are:</p>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="font-bold text-slate-900">100 Requests</span> / Minute (Write operations)
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="font-bold text-slate-900">500 Requests</span> / Minute (Read operations)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A2A5C] p-8 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative group">
                  <div className="relative z-10 flex items-start gap-5">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                      <Info className="w-6 h-6 text-blue-300" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold text-white text-lg">
                        API Policy & Visibility
                      </h4>
                      <p className="text-blue-100/70 leading-relaxed text-[15px] max-w-2xl">
                        Campaigns created via API are **isolated** from the main RefreeG web portal. 
                        They do not appear in platform search results or the featured sections. 
                        You maintain full ownership of the user interface and the distribution channel.
                      </p>
                      <div className="pt-2">
                        <Link href="/dashboard/developer" className="text-white font-bold flex items-center gap-2 group-hover:gap-3 transition-all text-sm">
                          Go to Developer Dashboard <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sidebarSelection === "Authentication" && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <header className="space-y-4">
                  <h1 className="text-3xl font-extrabold text-slate-900">
                    Authentication
                  </h1>
                  <p className="text-slate-500 text-lg font-medium">
                    All API requests must include your secret key in the Authorization header.
                  </p>
                </header>

                <section className="space-y-8">
                  <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <ShieldCheck className="w-32 h-32 text-blue-400" />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <h4 className="text-blue-400 text-[12px] uppercase font-bold tracking-[0.2em]">
                        Bearer Token Authorization
                      </h4>
                      <div className="flex items-center gap-4 bg-slate-950 p-5 rounded-2xl border border-white/5">
                        <code className="text-blue-300 font-mono text-[15px] flex-1">
                          Authorization: Bearer rg_test_sk_abc123...
                        </code>
                        <button className="text-slate-500 hover:text-white transition-colors">
                           <LayoutDashboard className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 border border-slate-100 rounded-3xl bg-slate-50/30 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                        <h3 className="font-bold text-slate-900">Sandbox Environment</h3>
                      </div>
                      <p className="text-[14px] text-slate-600 leading-relaxed">
                        Use keys starting with <code className="bg-slate-100 px-1.5 py-0.5 rounded text-orange-700 font-bold">rg_test_sk_</code> manually 
                        test your integrations. Sandbox requests do not initiate real bank transfers.
                      </p>
                    </div>
                    <div className="p-8 border border-slate-100 rounded-3xl bg-slate-50/30 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <h3 className="font-bold text-slate-900">Live Production</h3>
                      </div>
                      <p className="text-[14px] text-slate-600 leading-relaxed">
                        Keys starting with <code className="bg-slate-100 px-1.5 py-0.5 rounded text-green-700 font-bold">rg_live_sk_</code> are 
                        for production environments. Keep these keys extremely secure.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="font-bold text-red-900">Security Warning</h5>
                      <p className="text-sm text-red-700 leading-relaxed">
                        Never share your **Secret Keys** or commit them to version control. If a key is compromised, 
                        rotate it immediately via the <Link href="/dashboard/developer/api-keys" className="font-bold underline">API Management Dashboard</Link>.
                      </p>
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
  -H "X-RefreeG-Secret: YOUR_TEST_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Clean Water Project",
    "description": "Providing safe drinking water to rural communities in Nigeria.",
    "goal_amount": 1000000,
    "payout_mode": "after_deadline",
    "deadline": "2026-12-31T23:59:59Z",
    "bank_account_number": "0123456789",
    "bank_code": "058",
    "bank_account_name": "Project Fund"
  }'`,
                    },
                    {
                      step: "03",
                      title: "Send a Donation",
                      content:
                        "Use the donation initialization endpoint to get a secure checkout link.",
                      code: `curl -X POST https://api.refreeg.com/api/bot/donations/initialize \\
  -H "X-RefreeG-Secret: YOUR_TEST_KEY" \\
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

            {sidebarSelection === "Best Practices" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <header className="space-y-4">
                  <h1 className="text-3xl font-extrabold text-slate-900">
                    API Best Practices
                  </h1>
                  <p className="text-slate-500 text-lg">
                    Build resilient and secure integrations with RefreeG.
                  </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 border border-slate-100 rounded-3xl bg-white space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 text-blue-600">
                      <ShieldCheck className="w-6 h-6" />
                      <h3 className="font-bold text-xl">Security First</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Never expose your **Secret Keys** in client-side code, mobile apps, or public repositories. Always proxy API calls through your backend to avoid exposure.
                    </p>
                  </div>

                  <div className="p-8 border border-slate-100 rounded-3xl bg-white space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 text-amber-600">
                      <Zap className="w-6 h-6" />
                      <h3 className="font-bold text-xl">Idempotency</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Always implement idempotency on your end. Payment confirmations and campaign updates should be checked against your internal database to prevent duplicate processing.
                    </p>
                  </div>
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
                      "The display title for the campaign. Minimum 5 characters, maximum 100.",
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
                    description:
                      "Frequency of settlement. Options: 'after_deadline' or 'immediate'.",
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
                ]}
                requestExample={`{
  "title": "Hospital Recovery Fund",
  "description": "Patient needs immediate surgery for recovery.",
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
                    description: "Updated campaign title (5-100 characters).",
                  },
                  {
                    name: "description",
                    type: "string",
                    required: false,
                    description: "Updated campaign overview (20-5000 characters).",
                  },
                  {
                    name: "deadline",
                    type: "string",
                    required: false,
                    description: "Updated ISO 8601 deadline string.",
                  },
                ]}
                requestExample={`{
  "title": "New Hospital Fund Name",
  "description": "Updated details about the patient's recovery process."
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
                    description: "High-level reason for the report (5-100 characters).",
                  },
                  {
                    name: "message",
                    type: "string",
                    required: false,
                    description: "Optional detailed explanation (max 2000 characters).",
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
    { "id": "education", "display_name": "Education" },
    { "id": "health", "display_name": "Healthcare & Medical" }
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
                    description: "The display title to validate (Min 5, Max 100 characters).",
                  },
                  {
                    name: "description",
                    type: "string",
                    required: true,
                    description: "Campaign overview (20-5000 characters).",
                  },
                  {
                    name: "goal_amount",
                    type: "number",
                    required: true,
                    description: "The target goal amount (Must be > 0).",
                  },
                  {
                    name: "payout_mode",
                    type: "string",
                    required: true,
                    description: "One of: 'immediate', 'after_deadline'.",
                  },
                  {
                    name: "bank_account_number",
                    type: "string",
                    required: true,
                    description: "The 10-digit NUBAN account number.",
                  },
                  {
                    name: "bank_code",
                    type: "string",
                    required: true,
                    description: "The 3-digit bank code.",
                  },
                  {
                    name: "bank_account_name",
                    type: "string",
                    required: true,
                    description: "The verified legal account name.",
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
                    description: "The unique UUID of the target campaign to receive the donation.",
                  },
                  {
                    name: "amount",
                    type: "number",
                    required: true,
                    description: "The donation amount in the campaign's base currency (e.g., NGN).",
                  },
                  {
                    name: "email",
                    type: "string",
                    required: true,
                    description: "The donor's valid email address for digital receipts and updates.",
                  },
                  {
                    name: "name",
                    type: "string",
                    required: false,
                    description: "The legal or preferred name of the donor for recognition.",
                  },
                  {
                    name: "message",
                    type: "string",
                    required: false,
                    description: "A personal note or message of support to be displayed on the campaign wall.",
                  },
                  {
                    name: "is_anonymous",
                    type: "boolean",
                    required: false,
                    description: "If set to true, the donor's identity will be masked on the public wall (shown as 'Anonymous').",
                  },
                  {
                    name: "tip_amount",
                    type: "number",
                    required: false,
                    description: "An optional processing contribution to support the RefreeG platform.",
                  },
                  {
                    name: "callback_url",
                    type: "string",
                    required: false,
                    description: "The absolute URL where donors will be redirected after completing the payment flow.",
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
                        "The destination URL where RefreeG will send POST events. Must be HTTPS in production.",
                    },
                    {
                      name: "events",
                      type: "string[]",
                      required: true,
                      description:
                        "List of event triggers. Supported: 'campaign.created', 'campaign.verified', 'donation.completed', 'withdrawal.success'.",
                    },
                    {
                      name: "description",
                      type: "string",
                      required: false,
                      description: "Internal label for this webhook (max 100 chars).",
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
                          code: "unauthorized",
                          msg: "The API key provided is invalid, missing, or has been revoked.",
                        },
                        {
                          code: "rate_limited",
                          msg: "You have exceeded the request threshold (60 requests per minute).",
                        },
                        {
                          code: "validation_error",
                          msg: "The request body failed schema validation. Check the details array for specific field errors.",
                        },
                        {
                          code: "not_found",
                          msg: "The requested resource (campaign, donation, or webhook) does not exist.",
                        },
                        {
                          code: "bad_request",
                          msg: "The request JSON is malformed or contains invalid values.",
                        },
                        {
                          code: "payment_setup_failed",
                          msg: "RefreeG was unable to initialize payment details with the gateway provider.",
                        },
                        {
                          code: "internal_error",
                          msg: "An unexpected server-side error occurred. Please contact support if this persists.",
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
    </div>
  );
}
