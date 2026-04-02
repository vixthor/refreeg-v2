"use client";

import React from "react";
import { ShieldCheck, Info, Terminal } from "lucide-react";
import ApiEndpointDoc from "./ApiEndpointDoc";

export default function SectionWebhooks() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-8">
        <header className="space-y-4">
          <h1 className="text-3xl font-extrabold text-slate-900">Webhooks</h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Stay in sync with donation events in real-time. We push events to your servers securely.
          </p>
        </header>

        <ApiEndpointDoc
           title="Register Webhook"
          method="POST"
          url="/api/bot/webhooks"
          description="Registers a new endpoint to receive real-time donation events."
          parameters={[
            { name: "url", type: "string", required: true, description: "Your HTTPS endpoint URL to receive POST requests." },
            { name: "events", type: "array<string>", required: true, description: "List of events to subscribe to (e.g., ['donation.success', 'campaign.completed'])." },
          ]}
          requestExample={`{
  "url": "https://server.com/api/refreeg-events",
  "events": ["donation.success"]
}`}
          responseExample={`{
  "status": "success",
  "data": {
    "webhook_id": "wh_456...",
    "signing_secret": "whsec_789abc..."
  }
}`}
        />

        <div className="space-y-8 pt-6">
          <div className="p-8 border-2 border-slate-900 rounded-3xl bg-slate-900 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-green-400" />
              Verifying Webhook Signatures
            </h3>
            <p className="text-slate-300 text-[14px] leading-relaxed">
              Every webhook contains a <code className="text-blue-400 font-bold bg-white/5 px-2 py-0.5 rounded">X-RefreeG-Signature</code> header. 
              Always verify this using your webhook's unique <span className="font-bold text-white px-1">signing_secret</span> to ensure the data is authentically from RefreeG.
            </p>

            <div className="bg-slate-950 p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <Terminal className="w-4 h-4" /> signature verification (node.js)
              </div>
              <pre className="text-blue-300 font-mono text-[13px] leading-relaxed scrollbar-hide py-2">
{`// The header format: X-RefreeG-Signature: t=1234567890,v1=abc...
const sigHeader = req.headers["x-refreeg-signature"];
const [tPart, vPart] = sigHeader.split(",");
const timestamp = tPart.replace("t=", "");
const signature = vPart.replace("v1=", "");

// Reconstruct the signed payload
const body = JSON.stringify(req.body);
const hmac = crypto.createHmac("sha256", webhook_secret);
const expectedSig = hmac.update(\`\${timestamp}.\${body}\`).digest("hex");

if (signature === expectedSig) {
  // ✅ Request is authentic
}`}
              </pre>
            </div>
          </div>
        </div>

        <div className="p-8 border border-slate-100 rounded-3xl bg-amber-50/50 space-y-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-slate-900 text-lg">Retries & Reliability</h4>
          </div>
          <p className="text-slate-600 text-[14px] leading-relaxed">
             If your server responds with anything other than a **2xx Successful** status code, 
             RefreeG will retry the webhook delivery with an exponential backoff for up to **24 hours**. 
             Ensure your endpoints are idempotent to handle potential duplicate events.
          </p>
        </div>
      </div>
    </div>
  );
}
