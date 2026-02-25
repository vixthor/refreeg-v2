"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, HandHeart, ShieldAlert } from "lucide-react";
import type { Cause } from "@/types";
import Link from "next/link";

function getDefaultPledgeDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split("T")[0];
}

type ProfileSummary = {
  email: string;
  name: string;
  id: string;
  subaccount: string;
};

type CauseDetail = Cause & {
  user: {
    name: string;
    email: string;
    sub_account_code?: string | null;
  };
  summary?: string | null;
  location?: string | null;
};

type PledgeScreenProps = {
  cause: CauseDetail;
  profile: ProfileSummary;
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function StatItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <span className="text-[#64748B]">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-[#64748B]">{label}</p>
        <p className="font-semibold text-[#0F172A]">{value}</p>
      </div>
    </div>
  );
}

export default function PledgeScreen({ cause, profile }: PledgeScreenProps) {
  const [pledgeAmount, setPledgeAmount] = useState(25000);
  const [pledgeDate, setPledgeDate] = useState(getDefaultPledgeDate);
  const [pledgeName, setPledgeName] = useState(profile.name || "");
  const [pledgeEmail, setPledgeEmail] = useState(profile.email || "");
  const [pledgeNote, setPledgeNote] = useState("");
  const [pledgeSubmitted, setPledgeSubmitted] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#F6F8FB] pb-16 pt-10 text-[#0F172A] sm:pt-14"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 20%, rgba(37,99,235,0.08), transparent 60%)",
      }}
    >
      <div className="border-b border-[#E5E7EB] bg-white">
        <div className="container px-4 py-4 sm:py-6">
          <motion.div
            className="flex flex-col gap-5 sm:gap-6"
            initial="hidden"
            animate="show"
            variants={fadeUp}
          >
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] sm:text-sm">
              <Link
                href="/campaign-quality-test"
                className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold text-[#0F172A] shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to campaign
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold text-[#0F172A]">
                <HandHeart className="h-4 w-4 text-[#2563EB]" />
                Pledge
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-semibold leading-snug tracking-tight text-[#0F172A] sm:text-3xl lg:text-5xl">
                Pledge to support {cause.title}
              </h1>
              <p className="text-sm leading-relaxed text-[#64748B] sm:text-base lg:text-lg">
                {cause.summary ||
                  "Make a pledge today and we will email you on your chosen date to complete the contribution."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[#64748B]">
              <StatItem icon={<HandHeart className="h-4 w-4 text-[#2563EB]" />} label="Campaign" value="Verified" />
              <StatItem
                icon={<ShieldAlert className="h-4 w-4 text-[#F59E0B]" />}
                label="Reminder"
                value="Email"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <main className="container grid gap-6 px-4 pt-6 sm:pt-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <motion.div
            className="rounded-[14px] border border-[#E5E7EB] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-6"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Pledge</p>
              <HandHeart className="h-4 w-4 text-[#2563EB]" />
            </div>

            <h3 className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl">
              Pledge to pay later
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Make a pledge today and we will remind you by email on the date you choose. This is a
              commitment only — no payment is taken now.
            </p>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  Pledge amount
                </span>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <span className="text-sm font-semibold text-slate-500">₦</span>
                  <input
                    type="number"
                    min={1}
                    value={pledgeAmount}
                    onChange={(event) => {
                      setPledgeAmount(Number(event.target.value));
                      setPledgeSubmitted(false);
                    }}
                    className="w-full bg-transparent text-right text-sm text-slate-900 outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500">Choose the amount you plan to pay later.</p>
              </label>

              <label className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  Reminder date
                </span>
                <input
                  type="date"
                  value={pledgeDate}
                  onChange={(event) => {
                    setPledgeDate(event.target.value);
                    setPledgeSubmitted(false);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                />
                <p className="text-xs text-slate-500">
                  We will send a reminder on this date by email. SMS reminders can be added later.
                </p>
              </label>

              <label className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="text-xs uppercase tracking-[0.15em] text-slate-500">Name</span>
                <input
                  type="text"
                  value={pledgeName}
                  onChange={(event) => {
                    setPledgeName(event.target.value);
                    setPledgeSubmitted(false);
                  }}
                  placeholder="Your name"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                />
              </label>

              <label className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="text-xs uppercase tracking-[0.15em] text-slate-500">Email</span>
                <input
                  type="email"
                  value={pledgeEmail}
                  onChange={(event) => {
                    setPledgeEmail(event.target.value);
                    setPledgeSubmitted(false);
                  }}
                  placeholder="you@example.com"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                />
                <p className="text-xs text-slate-500">We will only email about this pledge.</p>
              </label>

              <label className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  Message (optional)
                </span>
                <textarea
                  rows={3}
                  value={pledgeNote}
                  onChange={(event) => {
                    setPledgeNote(event.target.value);
                    setPledgeSubmitted(false);
                  }}
                  placeholder="Add a note to the organiser"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                />
              </label>
            </div>

            {pledgeSubmitted && (
              <div
                className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                aria-live="polite"
              >
                Pledge saved. We will remind you on {pledgeDate || "your selected date"} to complete
                your ₦{Number(pledgeAmount || 0).toLocaleString()} contribution.
                <button
                  type="button"
                  onClick={() => setPledgeSubmitted(false)}
                  className="mt-2 inline-flex text-xs font-semibold text-emerald-800 underline underline-offset-4"
                >
                  Edit pledge
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPledgeSubmitted(true)}
              className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              Save pledge &amp; remind me
            </button>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-base font-semibold text-[#7C2D12] sm:text-lg">
              <ShieldAlert className="h-5 w-5 text-[#F59E0B]" />
              This is a pledge only. You will not be charged today.
            </div>
          </motion.div>
        </section>

        <aside className="space-y-6">
          <motion.div
            className="rounded-[14px] border border-[#E5E7EB] bg-white p-4 text-sm text-slate-600 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-6"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">What happens next</p>
            <p className="mt-3">
              We will email you on your selected reminder date with a direct link to complete the
              contribution. You can edit or cancel the pledge at any time before then.
            </p>
          </motion.div>
        </aside>
      </main>
    </div>
  );
}
