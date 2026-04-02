"use client";

import React from "react";
import { Info, ExternalLink, Terminal, ShieldCheck } from "lucide-react";
import Link from "next/link";
import ApiEndpointDoc from "./ApiEndpointDoc";

export function SectionErrorRef() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-10">
        <header className="space-y-4">
          <h1 className="text-3xl font-extrabold text-slate-900">Error Codes</h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Unambiguous response codes for every failure mode.
          </p>
        </header>

        <div className="p-8 border border-slate-100 rounded-3xl bg-white shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50 text-slate-400 font-bold tracking-wider uppercase text-[11px]">
                <th className="text-left pb-4">Identifier</th>
                <th className="text-left pb-4">HTTP Status</th>
                <th className="text-left pb-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { id: "validation_error", code: "400", desc: "Request body failed schema verification (Zod). Check the 'details' field for specifics." },
                { id: "bad_request", code: "400", desc: "General bad request — missing parameters, invalid JSON, or mode mismatch." },
                { id: "campaign_not_active", code: "400", desc: "The targeted campaign is paused, cancelled, or completed." },
                { id: "payment_setup_failed", code: "400", desc: "Bank account verification or sub-account creation failed." },
                { id: "invalid_bank_account", code: "400", desc: "The provided bank account details could not be resolved." },
                { id: "unauthorized", code: "401", desc: "API key is missing, invalid, or revoked." },
                { id: "invalid_api_key", code: "401", desc: "The API key format is correct but the key does not exist." },
                { id: "forbidden", code: "403", desc: "Access denied — you do not own this resource." },
                { id: "not_found", code: "404", desc: "The specified resource (campaign, donation, webhook) doesn't exist." },
                { id: "campaign_not_found", code: "404", desc: "The specified campaign ID does not exist." },
                { id: "rate_limit_exceeded", code: "429", desc: "API request quota reached. Default: 60 requests per minute." },
                { id: "payment_failed", code: "500", desc: "Payment gateway returned an unexpected error." },
                { id: "database_error", code: "500", desc: "A database operation failed unexpectedly." },
                { id: "internal_error", code: "500", desc: "An unexpected error occurred on our infrastructure." },
              ].map((err, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5">
                    <code className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded text-[13px]">{err.id}</code>
                  </td>
                  <td className="py-5 font-bold text-slate-900">{err.code}</td>
                  <td className="py-5 text-slate-500 leading-relaxed max-w-[300px]">{err.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SectionResources() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-10">
        <header className="space-y-4">
          <h1 className="text-3xl font-extrabold text-slate-900">SDKs & Libraries</h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Accelerate development with our official language-specific libraries.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 border border-slate-100 rounded-3xl bg-white shadow-sm group hover:border-blue-400/50 transition-all cursor-not-allowed">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform">
                <Terminal className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">Coming Soon</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Node.js SDK</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Full TypeScript support and automatic HMAC signature verification built-in.</p>
          </div>

          <div className="p-8 border border-slate-100 rounded-3xl bg-white shadow-sm group hover:border-blue-400/50 transition-all cursor-not-allowed">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                <Info className="w-6 h-6 text-slate-600" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full">Beta</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Python Library</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Native support for Django, Flask, and FastAPI frameworks with async/await support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
