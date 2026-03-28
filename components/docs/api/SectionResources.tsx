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
                { id: "VALIDATION_ERROR", code: "400", desc: "Request body failed schema verification (Zod)." },
                { id: "UNAUTHORIZED", code: "401", desc: "API key is missing, invalid, or expired." },
                { id: "PERMISSION_DENIED", code: "403", desc: "Access denied for the requested resource." },
                { id: "NOT_FOUND", code: "404", desc: "The specified object (campaign, donation) doesn't exist." },
                { id: "RATE_LIMIT_EXCEEDED", code: "429", desc: "API request quota reached for the current minute." },
                { id: "INTERNAL_SERVER_ERROR", code: "500", desc: "An unexpected error occurred on our infrastructure." },
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
