"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  Gift,
  History,
  Send,
} from "lucide-react";

const transactions = [
  { label: "Campaign share reward", time: "Today, 1:14 PM", amount: "+100" },
  { label: "Comment reward", time: "Today, 10:32 AM", amount: "+50" },
  { label: "Donation bonus", time: "Yesterday, 8:10 PM", amount: "+500" },
  { label: "Claimed to wallet", time: "Feb 8, 4:55 PM", amount: "-300" },
];

export default function EizaRewardsScreen() {
  const [showBalance, setShowBalance] = useState(true);

  const visibleBalance = useMemo(
    () => (showBalance ? "3,250 EIZA" : "••••• EIZA"),
    [showBalance]
  );

  return (
    <div className="relative bg-[#f3f5f8] px-3 pb-2 pt-24 sm:px-4 sm:pb-3 sm:pt-28 md:pb-6">
      <div className="mx-auto flex h-auto w-full max-w-md flex-col overflow-hidden rounded-[1.4rem] bg-white shadow-[0_16px_34px_rgba(15,23,42,0.08)] md:h-[82vh] md:max-w-xl">
        <div className="rounded-b-[1.3rem] bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-100">EIZA Rewards Wallet</p>
            <button
              type="button"
              onClick={() => setShowBalance((prev) => !prev)}
              className="rounded-md bg-white/15 p-2 transition hover:bg-white/25"
              aria-label="Toggle balance visibility"
            >
              {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>

          <p className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {visibleBalance}
          </p>
          <p className="mt-1 text-xs text-blue-100 sm:text-sm">≈ $1,242.50 USD</p>

          <div className="mt-3 rounded-lg bg-white/15 p-2">
            <div className="flex items-center justify-between text-[11px] text-blue-100 sm:text-xs">
              <span>7d change</span>
              <span className="font-semibold text-emerald-200">+12.8%</span>
            </div>
            <svg className="mt-1 h-8 w-full" viewBox="0 0 240 32" fill="none">
              <path
                d="M2 25C18 19 24 8 39 10C54 12 59 27 75 24C92 21 98 6 115 8C132 10 138 25 155 22C173 19 179 7 198 10C213 13 223 18 238 6"
                stroke="rgba(186,230,253,0.95)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4">
          <button className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-700">
            <Gift size={14} />
            Claim
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-700">
            <Send size={14} />
            Send
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-700">
            <History size={14} />
            History
          </button>
        </div>

        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">
              NEXT REWARD TIER
            </p>
            <div className="mt-2 h-2 rounded-full bg-slate-200">
              <div className="h-2 w-3/4 rounded-full bg-blue-500" />
            </div>
            <p className="mt-2 text-xs text-slate-600">750 / 1000 points to Gold</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 sm:px-4">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">
            TRANSACTIONS
          </p>
          <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
            {transactions.map((item) => {
              const isPositive = item.amount.startsWith("+");
              return (
                <div
                  key={`${item.label}-${item.time}`}
                  className="flex items-center justify-between px-3 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-full bg-slate-100 p-1.5 text-slate-500">
                      {isPositive ? (
                        <ArrowDownLeft size={14} />
                      ) : (
                        <ArrowUpRight size={14} />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.time}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      isPositive ? "text-emerald-600" : "text-slate-500"
                    }`}
                  >
                    {item.amount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
