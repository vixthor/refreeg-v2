"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeft,
  Eye,
  EyeOff,
  History,
} from "lucide-react";
import { useEventListeners, type EventPayload } from "@/hooks/use-event-listeners";
import { useAuth } from "@/hooks/use-auth";
import { getUserWallet, getUserStats } from "@/actions/event-reward-actions";
import { trackLogin } from "@/actions/auth-actions";
import Link from "next/link";
import type { RewardTransaction, UserStreak } from "@/types";

interface Transaction {
  label: string;
  time: string;
  amount: string;
  id: string;
}

export default function EizaRewardsScreen() {
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();

  // Fetch initial wallet data
  const fetchWalletData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const walletData = await getUserWallet(user.id);
      if (walletData.wallet) {
        setBalance(walletData.wallet.balance || 0);
      }

      // Format transactions for display
      if (walletData.transactions && Array.isArray(walletData.transactions)) {
        const formatted = walletData.transactions.map((t: RewardTransaction) => ({
          id: t.id,
          label: formatTransactionLabel(t.transaction_type),
          time: formatTime(t.created_at),
          amount: `+${t.amount}`,
        }));
        setTransactions(formatted);
      }

      const userStats = await getUserStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleLoginReward = useCallback(async () => {
    if (!user?.id) return;

    const todayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `eiza_daily_login_reward_${user.id}`;

    try {
      const lastRewardDate = window.localStorage.getItem(storageKey);
      if (lastRewardDate === todayKey) {
        return;
      }

      await trackLogin(user.id);
      window.localStorage.setItem(storageKey, todayKey);
      await fetchWalletData();
    } catch (error) {
      console.error("Error handling daily login reward:", error);
    }
  }, [user?.id, fetchWalletData]);

  // Set up event listeners
  useEventListeners({
    userId: user?.id,
    onComment: async (payload) => {
      handleEventPayload(payload);
    },
    onShare: async (payload) => {
      handleEventPayload(payload);
    },
    onDonation: async (payload) => {
      handleEventPayload(payload);
    },
    onLogin: async () => {
      await handleLoginReward();
    },
    onWeeklyStreak: async (payload) => {
      handleEventPayload(payload);
      await fetchWalletData();
    },
    onMonthlyActive: async (payload) => {
      handleEventPayload(payload);
      await fetchWalletData();
    },
  });

  const handleEventPayload = (payload: EventPayload) => {
    // Update balance optimistically
    const rewardAmounts: Record<string, number> = {
      comment: 50,
      share: 100,
      donation: 100, // Default, actual amount depends on donation size
      login: 1,
      weekly_streak: 500,
      monthly_active: 1000,
    };

    const amount = rewardAmounts[payload.type] || 0;
    setBalance((prev) => prev + amount);

    // Add transaction to list
    const newTransaction: Transaction = {
      id: `${payload.type}-${payload.timestamp}`,
      label: formatTransactionLabel(payload.type),
      time: "Just now",
      amount: `+${amount}`,
    };

    setTransactions((prev) => [newTransaction, ...prev.slice(0, 49)]);
  };

  useEffect(() => {
    if (!authLoading) {
      fetchWalletData();
    }
  }, [authLoading, fetchWalletData]);

  const visibleBalance = useMemo(
    () => (showBalance ? `${balance.toLocaleString()} EIZA` : "••••• EIZA"),
    [showBalance, balance]
  );

  const usdEquivalent = useMemo(
    () => (balance * 0.3825).toFixed(2), // Assuming 1 EIZA = $0.3825
    [balance]
  );

  return (
    <div className="relative bg-[#f3f5f8] px-3 pb-2 pt-24 sm:px-4 sm:pb-3 sm:pt-28 md:pb-6">
      <div className="mx-auto flex h-auto w-full max-w-md flex-col overflow-hidden rounded-[1.4rem] bg-white shadow-[0_16px_34px_rgba(15,23,42,0.08)] md:h-[82vh] md:max-w-xl">
        <div className="rounded-b-[1.3rem] bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                aria-label="Back to home"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              >
                <ArrowLeft size={16} />
              </Link>
              <p className="text-sm font-medium text-blue-100">EIZA Rewards Wallet</p>
            </div>
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
          <p className="mt-1 text-xs text-blue-100 sm:text-sm">
            ≈ ${usdEquivalent} USD
          </p>

          <div className="mt-3 rounded-lg bg-white/15 p-2">
            <div className="flex items-center justify-between text-[11px] text-blue-100 sm:text-xs">
              <span>Active Today</span>
              <span className="font-semibold text-emerald-200">
                {stats?.weekly_streak || 0} day streak
              </span>
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

        <div className="grid grid-cols-1 gap-2 p-3 sm:gap-3 sm:p-4">
          <button className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
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
              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${((balance % 1000) / 1000) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-600">
              {balance % 1000} / 1000 points to next tier
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 sm:px-4">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">
            TRANSACTIONS
          </p>
          <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
            {transactions.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">
                {loading ? "Loading transactions..." : "No transactions yet. Start earning rewards!"}
              </div>
            ) : (
              transactions.map((item) => {
                const isPositive = item.amount.startsWith("+");
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-3 transition hover:bg-slate-50"
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
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTransactionLabel(type: string): string {
  const labels: Record<string, string> = {
    comment: "Comment reward",
    share: "Campaign share reward",
    donation: "Donation bonus",
    login: "Daily login bonus",
    weekly_streak: "Weekly streak reward",
    monthly_active: "Monthly active bonus",
  };
  return labels[type] || "Reward earned";
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}



