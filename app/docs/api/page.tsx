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
import ApiSidebar from "@/components/docs/api/ApiSidebar";
import ApiPlayground from "@/components/docs/api/ApiPlayground";

// New Section Imports
import SectionIntro from "@/components/docs/api/SectionIntro";
import SectionAuth from "@/components/docs/api/SectionAuth";
import SectionAiBlueprint from "@/components/docs/api/SectionAiBlueprint";
import SectionQuickstart from "@/components/docs/api/SectionQuickstart";
import SectionBestPractices from "@/components/docs/api/SectionBestPractices";
import {
  SectionCreateCampaign,
  SectionUpdateCampaign,
  SectionListCampaigns,
  SectionRetrieveCampaign,
  SectionBanks,
} from "@/components/docs/api/EndpointCampaigns";
import { SectionDonations } from "@/components/docs/api/EndpointDonations";
import {
  SectionValidateAi,
  SectionReportCampaign,
  SectionCategories,
} from "@/components/docs/api/EndpointMisc";
import SectionWebhooks from "@/components/docs/api/SectionWebhooks";
import {
  SectionErrorRef,
  SectionResources,
} from "@/components/docs/api/SectionResources";

export default function ApiDocsPage() {
  const [sidebarSelection, setSidebarSelection] = useState("Introduction");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const renderContent = () => {
    switch (sidebarSelection) {
      case "Introduction":
        return <SectionIntro />;
      case "Authentication":
        return <SectionAuth />;
      case "AI Integration Blueprint":
        return <SectionAiBlueprint />;
      case "Quickstart Guide":
        return <SectionQuickstart />;
      case "Best Practices":
        return <SectionBestPractices />;
      case "Create Campaign":
        return <SectionCreateCampaign />;
      case "Retrieve Campaign":
        return <SectionRetrieveCampaign />;
      case "List Campaigns":
        return <SectionListCampaigns />;
      case "Update Campaign":
        return <SectionUpdateCampaign />;
      case "Manage Banks":
        return <SectionBanks />;
      case "AI Blueprint Validation":
        return <SectionValidateAi />;
      case "Initialize Donation":
        return <SectionDonations />;
      case "Verify Donation":
        return <SectionDonations />; // Both in same component
      case "List Categories":
        return <SectionCategories />;
      case "Report Campaign":
        return <SectionReportCampaign />;
      case "Webhooks & Events":
        return <SectionWebhooks />;
      case "Error Reference":
        return <SectionErrorRef />;
      case "SDKs & Libraries":
        return <SectionResources />;
      case "API Playground":
        return <ApiPlayground />;
      default:
        return <SectionIntro />;
    }
  };

  return (
    <div className="w-full bg-white min-h-screen text-slate-900 selection:bg-blue-100 italic-none">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-bold text-[18px] tracking-tight text-slate-900">
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
                className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900"
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
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            API READY
          </span>
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
              <span className="font-extrabold text-blue-600 tracking-tight uppercase">
                API NAV
              </span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-2">
              <div className="px-4 py-6 border-b border-slate-50 mb-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Search..."
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-900"
                  />
                </div>
              </div>
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

      <div className="mx-auto max-w-[1500px] flex flex-col md:flex-row gap-10 px-4 md:px-6 pt-10 pb-20 relative">
        <div className="hidden md:block shrink-0 w-72 min-w-[280px] z-30">
          <div className="sticky top-24 h-[calc(100vh-8rem)]">
            <ApiSidebar
              selected={sidebarSelection}
              onSelect={setSidebarSelection}
            />
          </div>
        </div>

        <main className="flex-1 min-w-0 pb-20 z-10">{renderContent()}</main>
      </div>
    </div>
  );
}
