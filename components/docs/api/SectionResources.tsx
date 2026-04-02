"use client";

import React, { useState } from "react";
import { Info, ExternalLink, Terminal, ShieldCheck, BookOpen, Download } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"node" | "python">("node");

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-10">
        <header className="space-y-4">
          <h1 className="text-3xl font-extrabold text-slate-900">SDKs & Libraries</h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Accelerate development with our official language-specific libraries. We provide fully typed, ready-to-use SDKs for Node.js and Python.
          </p>
          <div className="flex items-start gap-4 p-5 border border-amber-200 bg-amber-50 rounded-2xl text-amber-800 mt-6">
            <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Please Note: SDKs are Currently Local in the Project</p>
              <p className="text-sm mt-1 leading-relaxed">If you try to run <code>npm install @refreeg/sdk</code> right now, it will fail because we have not published it to the public NPM or PyPI registries yet! The source code generated resides in the <code>sdks/</code> directory of your repository. For immediate integration, you can import them locally into your backend.</p>
            </div>
          </div>
        </header>

        <div>
          {/* Tabs header */}
          <div className="flex space-x-1 bg-slate-100 p-1.5 rounded-xl mb-8 max-w-sm">
            <button
              onClick={() => setActiveTab("node")}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                activeTab === "node" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Node.js
            </button>
            <button
              onClick={() => setActiveTab("python")}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                activeTab === "python" ? "bg-white text-yellow-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Python
            </button>
          </div>

          {/* Tab Content: Node */}
          {activeTab === "node" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Terminal className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xl">Node.js SDK (TypeScript)</h3>
                  <p className="text-slate-500 text-sm">Full TypeScript support with comprehensive type definitions.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="p-6 bg-[#0B1120] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div></div>
                    <span className="ml-2 text-xs font-medium text-slate-500 font-mono">Terminal / Installation</span>
                  </div>
                  <pre className="text-sm font-mono text-slate-300 overflow-x-auto pb-2">
                    <code className="text-blue-400">npm install </code><code className="text-slate-300">@refreeg/sdk</code>
                  </pre>
                </div>

                <div className="p-6 bg-[#0B1120] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <span className="ml-2 text-xs font-medium text-slate-500 font-mono">index.ts - Initialization</span>
                  </div>
                  <pre className="text-sm font-mono text-slate-300 overflow-x-auto pb-4">
                    <code className="text-purple-400">import</code> <code className="text-slate-300">{`{ Refreeg }`}</code> <code className="text-purple-400">from</code> <code className="text-green-300">"@refreeg/sdk"</code>;
                    <br /><br />
                    <code className="text-slate-500">{`// Initialize the client`}</code><br />
                    <code className="text-purple-400">const</code> <code className="text-slate-300">refreeg</code> = <code className="text-purple-400">new</code> <code className="text-amber-300">Refreeg</code>({`{`}<br />
                    <code className="text-slate-300">&nbsp;&nbsp;apiKey: </code><code className="text-green-300">process.env.REFREEG_API_KEY</code>,<br />
                    {`}`});
                  </pre>
                </div>

                <div className="p-6 bg-[#0B1120] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <span className="ml-2 text-xs font-medium text-slate-500 font-mono">campaigns.ts - Full Campaign Lifecycle</span>
                  </div>
                  <pre className="text-sm font-mono text-slate-300 overflow-x-auto pb-4">
                    <code className="text-slate-500">{`// 1. Create a campaign`}</code><br />
                    <code className="text-purple-400">const</code> <code className="text-slate-300">campaign</code> = <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.campaigns.</code><code className="text-blue-300">create</code>({`{`}<br />
                    <code className="text-slate-300">&nbsp;&nbsp;title: </code><code className="text-green-300">"Emergency Relief Fund"</code>,<br />
                    <code className="text-slate-300">&nbsp;&nbsp;goal_amount: </code><code className="text-orange-300">500000</code><br />
                    <code className="text-slate-300">{`}`});</code><br /><br />
                    
                    <code className="text-slate-500">{`// 2. Fetch a single campaign & List all`}</code><br />
                    <code className="text-purple-400">const</code> <code className="text-slate-300">details</code> = <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.campaigns.</code><code className="text-blue-300">get</code>(<code className="text-slate-300">campaign.id</code>);<br />
                    <code className="text-purple-400">const</code> <code className="text-slate-300">allCampaigns</code> = <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.campaigns.</code><code className="text-blue-300">list</code>();<br /><br />
                    
                    <code className="text-slate-500">{`// 3. Update & Manage State`}</code><br />
                    <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.campaigns.</code><code className="text-blue-300">update</code>(<code className="text-slate-300">campaign.id</code>, {`{`} <code className="text-slate-300">title:</code> <code className="text-green-300">"Updated Campaign"</code> {`}`});<br />
                    <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.campaigns.</code><code className="text-blue-300">pause</code>(<code className="text-slate-300">campaign.id</code>);<br />
                    <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.campaigns.</code><code className="text-blue-300">resume</code>(<code className="text-slate-300">campaign.id</code>);<br />
                    <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.campaigns.</code><code className="text-blue-300">cancel</code>(<code className="text-slate-300">campaign.id</code>);<br /><br />

                    <code className="text-slate-500">{`// 4. Get all donatons for a campaign`}</code><br />
                    <code className="text-purple-400">const</code> <code className="text-slate-300">donors</code> = <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.campaigns.</code><code className="text-blue-300">donations</code>(<code className="text-slate-300">campaign.id</code>);
                  </pre>
                </div>

                <div className="p-6 bg-[#0B1120] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <span className="ml-2 text-xs font-medium text-slate-500 font-mono">finance.ts - Donations & Banks</span>
                  </div>
                  <pre className="text-sm font-mono text-slate-300 overflow-x-auto pb-4">
                    <code className="text-slate-500">{`// 1. Bank Configuration`}</code><br />
                    <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.banks.</code><code className="text-blue-300">register</code>({`{`} <code className="text-slate-300">account_number: </code><code className="text-green-300">"0123456789"</code><code className="text-slate-300">, bank_code: </code><code className="text-green-300">"058"</code> {`}`});<br />
                    <code className="text-purple-400">const</code> <code className="text-slate-300">myBanks</code> = <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.banks.</code><code className="text-blue-300">list</code>();<br /><br />
                    
                    <code className="text-slate-500">{`// 2. Process a Donation`}</code><br />
                    <code className="text-purple-400">const</code> <code className="text-slate-300">intent</code> = <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.donations.</code><code className="text-blue-300">initialize</code>({`{`}<br />
                    <code className="text-slate-300">&nbsp;&nbsp;campaign_id: </code><code className="text-green-300">"cmp_12345"</code>,<br />
                    <code className="text-slate-300">&nbsp;&nbsp;amount: </code><code className="text-orange-300">5000</code>,<br />
                    <code className="text-slate-300">&nbsp;&nbsp;email: </code><code className="text-green-300">"donor@example.com"</code><br />
                    <code className="text-slate-300">{`}`});</code><br /><br />

                    <code className="text-slate-500">{`// 3. Verify / Get Donation status`}</code><br />
                    <code className="text-purple-400">const</code> <code className="text-slate-300">verified</code> = <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.donations.</code><code className="text-blue-300">verify</code>(<code className="text-slate-300">intent.reference</code>);<br />
                    <code className="text-purple-400">const</code> <code className="text-slate-300">singleDonation</code> = <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.donations.</code><code className="text-blue-300">get</code>(<code className="text-slate-300">intent.id</code>);<br />
                  </pre>
                </div>

                <div className="p-6 bg-[#0B1120] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <span className="ml-2 text-xs font-medium text-slate-500 font-mono">webhooks.ts - Real-time Events</span>
                  </div>
                  <pre className="text-sm font-mono text-slate-300 overflow-x-auto pb-4">
                    <code className="text-purple-400">const</code> <code className="text-slate-300">webhook</code> = <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.webhooks.</code><code className="text-blue-300">register</code>({`{`}<br />
                    <code className="text-slate-300">&nbsp;&nbsp;url: </code><code className="text-green-300">"https://api.vourapp.com/refreeg-events"</code>,<br />
                    <code className="text-slate-300">&nbsp;&nbsp;events: [</code><code className="text-green-300">"donation.successful"</code><code className="text-slate-300">, </code><code className="text-green-300">"campaign.completed"</code><code className="text-slate-300">]</code><br />
                    {`}`});<br /><br />
                    <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.webhooks.</code><code className="text-blue-300">update</code>(<code className="text-slate-300">webhook.id</code>, {`{`} <code className="text-slate-300">url: </code><code className="text-green-300">"https://new-api.vourapp.com"</code> {`}`});<br />
                    <code className="text-purple-400">const</code> <code className="text-slate-300">allHooks</code> = <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.webhooks.</code><code className="text-blue-300">list</code>();<br />
                    <code className="text-blue-400">await</code> <code className="text-slate-300">refreeg.webhooks.</code><code className="text-blue-300">delete</code>(<code className="text-slate-300">webhook.id</code>);<br />
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Python */}
          {activeTab === "python" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-50 rounded-2xl">
                  <Terminal className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xl">Python SDK</h3>
                  <p className="text-slate-500 text-sm">Synchronous bindings optimized for Django, Flask, or pure Python projects.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="p-6 bg-[#0B1120] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div></div>
                    <span className="ml-2 text-xs font-medium text-slate-500 font-mono">Terminal / Installation</span>
                  </div>
                  <pre className="text-sm font-mono text-slate-300 overflow-x-auto pb-2">
                    <code className="text-blue-400">pip install </code><code className="text-slate-300">refreeg-sdk</code>
                  </pre>
                </div>

                <div className="p-6 bg-[#0B1120] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <span className="ml-2 text-xs font-medium text-slate-500 font-mono">main.py - Initialization</span>
                  </div>
                  <pre className="text-sm font-mono text-slate-300 overflow-x-auto pb-4">
                    <code className="text-purple-400">import</code> <code className="text-slate-300">os</code><br />
                    <code className="text-purple-400">from</code> <code className="text-slate-300">refreeg</code> <code className="text-purple-400">import</code> <code className="text-amber-300">Refreeg</code><br />
                    <code className="text-purple-400">from</code> <code className="text-slate-300">refreeg.client</code> <code className="text-purple-400">import</code> <code className="text-amber-300">RefreegError</code>
                    <br /><br />
                    <code className="text-slate-500">{`# Initialize the client`}</code><br />
                    <code className="text-slate-300">client = </code><code className="text-amber-300">Refreeg</code>(api_key=os.environ.get(<code className="text-green-300">"REFREEG_API_KEY"</code>))
                  </pre>
                </div>

                <div className="p-6 bg-[#0B1120] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <span className="ml-2 text-xs font-medium text-slate-500 font-mono">campaigns.py - Full Campaign Lifecycle</span>
                  </div>
                  <pre className="text-sm font-mono text-slate-300 overflow-x-auto pb-4">
                    <code className="text-slate-500">{`# 1. Create a campaign`}</code><br />
                    <code className="text-slate-300">campaign = client.campaigns.create({`{`}</code><br />
                    <code className="text-green-300">&nbsp;&nbsp;&nbsp;&nbsp;"title"</code><code className="text-slate-300">: </code><code className="text-green-300">"Medical Fund"</code>,<br />
                    <code className="text-green-300">&nbsp;&nbsp;&nbsp;&nbsp;"goal_amount"</code><code className="text-slate-300">: </code><code className="text-orange-300">500000</code><br />
                    <code className="text-slate-300">{`}`}</code>)<br /><br />
                    
                    <code className="text-slate-500">{`# 2. Fetch a single campaign & List all`}</code><br />
                    <code className="text-slate-300">details = client.campaigns.get(campaign[<code className="text-green-300">'id'</code>])</code><br />
                    <code className="text-slate-300">all_campaigns = client.campaigns.list()</code><br /><br />
                    
                    <code className="text-slate-500">{`# 3. Update & Manage State`}</code><br />
                    <code className="text-slate-300">client.campaigns.update(campaign[<code className="text-green-300">'id'</code>], {`{`} <code className="text-green-300">"title"</code>: <code className="text-green-300">"Updated Campaign"</code> {`}`} )</code><br />
                    <code className="text-slate-300">client.campaigns.pause(campaign[<code className="text-green-300">'id'</code>])</code><br />
                    <code className="text-slate-300">client.campaigns.resume(campaign[<code className="text-green-300">'id'</code>])</code><br />
                    <code className="text-slate-300">client.campaigns.cancel(campaign[<code className="text-green-300">'id'</code>])</code><br /><br />

                    <code className="text-slate-500">{`# 4. Get all donatons for a campaign`}</code><br />
                    <code className="text-slate-300">donors = client.campaigns.donations(campaign[<code className="text-green-300">'id'</code>])</code>
                  </pre>
                </div>

                <div className="p-6 bg-[#0B1120] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <span className="ml-2 text-xs font-medium text-slate-500 font-mono">finance.py - Processing Donations</span>
                  </div>
                  <pre className="text-sm font-mono text-slate-300 overflow-x-auto pb-4">
                    <code className="text-slate-500">{`# 1. Bank Configuration`}</code><br />
                    <code className="text-slate-300">bank = client.banks.register({`{`}</code><br />
                    <code className="text-green-300">&nbsp;&nbsp;&nbsp;&nbsp;"account_number"</code><code className="text-slate-300">: </code><code className="text-green-300">"0123456789"</code>,<br />
                    <code className="text-green-300">&nbsp;&nbsp;&nbsp;&nbsp;"bank_code"</code><code className="text-slate-300">: </code><code className="text-green-300">"058"</code><br />
                    <code className="text-slate-300">{`}`}</code>)<br />
                    <code className="text-slate-300">my_banks = client.banks.list()</code><br /><br />
                    
                    <code className="text-slate-500">{`# 2. Trigger a charge intent when user clicks 'Donate'`}</code><br />
                    <code className="text-slate-300">donation = client.donations.initialize({`{`}</code><br />
                    <code className="text-green-300">&nbsp;&nbsp;&nbsp;&nbsp;"campaign_id"</code><code className="text-slate-300">: </code><code className="text-green-300">"cmp_12345"</code>,<br />
                    <code className="text-green-300">&nbsp;&nbsp;&nbsp;&nbsp;"amount"</code><code className="text-slate-300">: </code><code className="text-orange-300">5000</code>,<br />
                    <code className="text-green-300">&nbsp;&nbsp;&nbsp;&nbsp;"email"</code><code className="text-slate-300">: </code><code className="text-green-300">"donor@example.com"</code><br />
                    <code className="text-slate-300">{`}`}</code>)<br /><br />

                    <code className="text-slate-500">{`# 3. Verify / Get Donation status`}</code><br />
                    <code className="text-slate-300">status = client.donations.verify(reference=<code className="text-green-300">"ref_9042b3"</code>)</code><br />
                    <code className="text-slate-300">single_donation = client.donations.get(donation[<code className="text-green-300">'id'</code>])</code>
                  </pre>
                </div>

                <div className="p-6 bg-[#0B1120] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <span className="ml-2 text-xs font-medium text-slate-500 font-mono">webhooks.py - Real-time Events</span>
                  </div>
                  <pre className="text-sm font-mono text-slate-300 overflow-x-auto pb-4">
                    <code className="text-slate-300">webhook = client.webhooks.register({`{`}</code><br />
                    <code className="text-green-300">&nbsp;&nbsp;&nbsp;&nbsp;"url"</code><code className="text-slate-300">: </code><code className="text-green-300">"https://api.vourapp.com/refreeg-events"</code>,<br />
                    <code className="text-green-300">&nbsp;&nbsp;&nbsp;&nbsp;"events"</code><code className="text-slate-300">: [</code><code className="text-green-300">"donation.successful"</code><code className="text-slate-300">, </code><code className="text-green-300">"campaign.completed"</code><code className="text-slate-300">]</code><br />
                    <code className="text-slate-300">{`}`}</code>)<br /><br />
                    
                    <code className="text-slate-300">client.webhooks.update(webhook[<code className="text-green-300">'id'</code>], {`{`} <code className="text-green-300">"url"</code>: <code className="text-green-300">"https://new-api.vourapp.com"</code> {`}`} )</code><br />
                    <code className="text-slate-300">all_hooks = client.webhooks.list()</code><br />
                    <code className="text-slate-300">client.webhooks.delete(webhook[<code className="text-green-300">'id'</code>])</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
