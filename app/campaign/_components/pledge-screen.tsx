"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { HandHeart, ShieldAlert } from "lucide-react";
import type { Cause } from "@/types";
import { createPledge } from "@/actions/pledge-actions";

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

const pledgePresets = [5000, 10000, 25000, 50000];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

function StatItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <span className="text-[#64748B]">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-[#64748B]">
          {label}
        </p>
        <p className="font-semibold text-[#0F172A]">{value}</p>
      </div>
    </div>
  );
}

export default function PledgeScreen({ cause, profile }: PledgeScreenProps) {
  const [pledgeAmount, setPledgeAmount] = useState(25000);
  const [pledgeAmountInput, setPledgeAmountInput] = useState("25,000");
  const [pledgeDate, setPledgeDate] = useState(getDefaultPledgeDate);
  const [pledgeName, setPledgeName] = useState(profile.name || "");
  const [pledgeEmail, setPledgeEmail] = useState(profile.email || "");
  const [pledgeNote, setPledgeNote] = useState("");
  const [pledgeSubmitted, setPledgeSubmitted] = useState(false);
  const [pledgeSubmitting, setPledgeSubmitting] = useState(false);
  const [pledgeError, setPledgeError] = useState<string | null>(null);
  const [pledgeId, setPledgeId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    amount?: string;
    date?: string;
    email?: string;
    name?: string;
  }>({});

  const resetSubmissionState = () => {
    setPledgeSubmitted(false);
    setPledgeError(null);
  };

  const clearFieldError = (key: keyof typeof fieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleFieldChange = (setter: (value: string) => void) => {
    return (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setter(event.target.value);
      resetSubmissionState();
    };
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const next = raw.replace(/,/g, "").replace(/\D/g, "");
    const capped = next.slice(0, 12);
    setPledgeAmountInput(capped);
    setPledgeAmount(capped ? Number(capped) : 0);
    resetSubmissionState();
    clearFieldError("amount");
  };

  const handleAmountBlur = () => {
    if (!pledgeAmountInput) {
      setPledgeAmountInput("");
      return;
    }
    setPledgeAmountInput(Number(pledgeAmountInput).toLocaleString());
  };

  const handleAmountFocus = () => {
    setPledgeAmountInput((prev) => prev.replace(/,/g, ""));
  };

  const handlePresetClick = (value: number) => {
    setPledgeAmount(value);
    setPledgeAmountInput(value.toLocaleString());
    resetSubmissionState();
    clearFieldError("amount");
  };

  const validatePledge = () => {
    const trimmedName = pledgeName.trim();
    const trimmedEmail = pledgeEmail.trim();
    const amountValue = Number(pledgeAmount || 0);

    const nextErrors: typeof fieldErrors = {};

    if (amountValue <= 0) {
      nextErrors.amount = "Enter a valid amount.";
    }

    if (!pledgeDate) {
      nextErrors.date = "Select a reminder date.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    }

    if (!trimmedName) {
      nextErrors.name = "Name is required.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return "Add a valid amount, reminder date, name, and email.";
    }

    return null;
  };

  const handleSubmit = async () => {
    if (pledgeSubmitting) return;

    const validationError = validatePledge();
    if (validationError) {
      setPledgeError(validationError);
      return;
    }

    setPledgeSubmitting(true);
    setPledgeError(null);

    try {
      const trimmedName = pledgeName.trim();
      const trimmedEmail = pledgeEmail.trim();
      const trimmedNote = pledgeNote.trim();
      const amountValue = Number(pledgeAmount || 0);

      const { data, error } = await createPledge({
        causeId: cause.id,
        amount: amountValue,
        reminderDate: pledgeDate,
        name: trimmedName,
        email: trimmedEmail,
        note: trimmedNote ? trimmedNote : null,
        causeTitle: cause.title,
      });

      if (error) {
        setPledgeError(error || "We could not save your pledge.");
        setPledgeSubmitted(false);
        return;
      }

      setPledgeId(data?.id ?? null);
      setPledgeSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "We could not save your pledge.";
      setPledgeError(message);
      setPledgeSubmitted(false);
    } finally {
      setPledgeSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#F6F8FB] pb-24 pt-10 text-[#0F172A] sm:pt-14"
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
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold text-[#0F172A]">
                <HandHeart className="h-4 w-4 text-[#2563EB]" />
                Pledge
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-semibold leading-snug tracking-tight text-[#0F172A] sm:text-3xl lg:text-5xl">
                Pledge now, donate later.
              </h1>
              <p className="text-sm leading-relaxed text-[#64748B] sm:text-base lg:text-lg">
                {cause.summary ||
                  "Make a pledge today and we will email you on your chosen date to complete the contribution."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[#64748B]">
              <StatItem
                icon={<HandHeart className="h-4 w-4 text-[#2563EB]" />}
                label="Campaign"
                value="Verified"
              />
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
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                Pledge
              </p>
              <HandHeart className="h-4 w-4 text-[#2563EB]" />
            </div>

            <h3 className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl">
              Pledge to donate later
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Make a pledge today and we will remind you by email on the date
              you choose. This is a commitment only — no donation is taken now.
            </p>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  Pledge amount
                </span>
                <div className="flex flex-wrap gap-2">
                  {pledgePresets.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handlePresetClick(value)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${
                        pledgeAmount === value
                          ? "border-[#2563EB] bg-[#2563EB] text-white"
                          : "border-[#E5E7EB] bg-white text-[#64748B]"
                      }`}
                    >
                      ₦{value.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <span className="text-sm font-semibold text-slate-500">
                    ₦
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    value={pledgeAmountInput}
                    onChange={handleAmountChange}
                    onBlur={handleAmountBlur}
                    onFocus={handleAmountFocus}
                    className="w-full bg-transparent text-right text-sm text-slate-900 outline-none"
                    placeholder="0"
                  />
                </div>
                {fieldErrors.amount && (
                  <p className="text-xs font-semibold text-rose-600">
                    {fieldErrors.amount}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  Choose the amount you plan to donate later.
                </p>
              </label>

              <label className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  Reminder date
                </span>
                <input
                  type="date"
                  value={pledgeDate}
                  min={getDefaultPledgeDate()}
                  max={(() => {
                    if (!cause.days_active) return undefined;
                    const end = new Date();
                    end.setDate(end.getDate() + cause.days_active);
                    return end.toISOString().split("T")[0];
                  })()}
                  onChange={(event) => {
                    handleFieldChange(setPledgeDate)(event);
                    clearFieldError("date");
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                />
                {fieldErrors.date && (
                  <p className="text-xs font-semibold text-rose-600">
                    {fieldErrors.date}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  We will send a reminder on this date by email.{cause.days_active ? ` Date must be before the campaign ends.` : ""} SMS reminders
                  can be added later.
                </p>
              </label>

              <label className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  Email
                </span>
                <input
                  type="email"
                  value={pledgeEmail}
                  onChange={(event) => {
                    handleFieldChange(setPledgeEmail)(event);
                    clearFieldError("email");
                  }}
                  placeholder="you@example.com"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                />
                {fieldErrors.email && (
                  <p className="text-xs font-semibold text-rose-600">
                    {fieldErrors.email}
                  </p>
                )}
              </label>

              <label className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  Name
                </span>
                <input
                  type="text"
                  value={pledgeName}
                  onChange={(event) => {
                    handleFieldChange(setPledgeName)(event);
                    clearFieldError("name");
                  }}
                  placeholder="Your name"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                />
                {fieldErrors.name && (
                  <p className="text-xs font-semibold text-rose-600">
                    {fieldErrors.name}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  We will only email about this pledge.
                </p>
              </label>

              <label className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  Message (optional)
                </span>
                <textarea
                  rows={3}
                  value={pledgeNote}
                  onChange={handleFieldChange(setPledgeNote)}
                  placeholder="Add a note to the organiser"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                />
              </label>
            </div>

            {pledgeError && (
              <div
                className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                role="alert"
              >
                {pledgeError}
              </div>
            )}

            {pledgeSubmitted && (
              <div
                className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                aria-live="polite"
              >
                Pledge saved. We will remind you on{" "}
                {pledgeDate || "your selected date"} to complete your ₦
                {Number(pledgeAmount || 0).toLocaleString()} contribution.
                {pledgeId && (
                  <span className="mt-1 block text-xs text-emerald-700">
                    Reference: {pledgeId}
                  </span>
                )}
                <span className="mt-1 block text-xs text-emerald-700">
                  Check your email for confirmation.
                </span>
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
              onClick={handleSubmit}
              disabled={pledgeSubmitting}
              className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pledgeSubmitting
                ? "Saving pledge..."
                : "Save pledge & remind me"}
            </button>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-[#7C2D12]">
              <ShieldAlert className="h-4 w-4 text-[#F59E0B]" />
              No payment today
            </div>

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
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
              Campaign
            </p>
            <div className="mt-3 flex items-start gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                {cause.image ? (
                  <img
                    src={cause.image}
                    alt={cause.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {cause.title}
                </p>
                {cause.location ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {cause.location}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Raised</span>
                <span className="font-semibold text-slate-900">
                  ₦{Number(cause.raised || 0).toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Goal</span>
                <span className="font-semibold text-slate-900">
                  ₦{Number(cause.goal || 0).toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Progress</span>
                <span className="font-semibold text-emerald-700">
                  {cause.goal
                    ? Math.round((cause.raised / cause.goal) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-white">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{
                    width: `${cause.goal ? Math.min((cause.raised / cause.goal) * 100, 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Organizer</p>
              <p className="mt-1">{cause.user.name}</p>
            </div>
          </motion.div>

          <motion.div
            className="rounded-[14px] border border-[#E5E7EB] bg-white p-4 text-sm text-slate-600 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-6"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
              What happens next
            </p>
            <p className="mt-3">
              We will email you on your selected reminder date with a direct
              link to complete the contribution. You can edit or cancel the
              pledge at any time before then.
            </p>
          </motion.div>
        </aside>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] sm:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pledgeSubmitting}
            className="flex-1 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pledgeSubmitting ? "Saving pledge..." : "Save pledge"}
          </button>
        </div>
      </div>
    </div>
  );
}
