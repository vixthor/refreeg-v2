"use client";

import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Globe,
  HandHeart,
  Image as ImageIcon,
  MapPin,
  MessagesSquare,
  ShieldAlert,
  ShieldCheck,
  Share2,
  Target,
  Users,
} from "lucide-react";
import type { Cause } from "@/types";
import { DonationForm } from "@/components/donation-form";
import SolanaDonationButtonWrapper from "@/components/crypto-details/SolanaDonationButtonWrapper";
import { Progress } from "@/components/ui/progress";
import { ShareModal } from "@/components/share-modal";
import MultimediaCarousel from "@/components/MultimediaCarousel";
import { getBaseURL } from "@/lib/utils";

const tabs = ["Story", "Milestones", "Updates", "Budget", "Comments", "FAQ"] as const;
const donationPresets = [1000, 10000, 100000, 1000000];
const tipPresets = [100, 500, 1000];

const impactBullets = [
  "Provides emergency shelter kits for displaced families.",
  "Escrowed milestones release funds only after proof.",
  "Updates, receipts, and photos are published for donors.",
];

const trustTiles = [
  {
    title: "Milestone escrow",
    status: "Active",
    badgeClass: "bg-[#22C55E]",
    badgeTextClass: "text-white",
    body: "Funds release only after proof review.",
  },
  {
    title: "Evidence review",
    status: "1 in progress",
    badgeClass: "bg-[#F59E0B]",
    badgeTextClass: "text-white",
    body: "Latest upload awaiting approval.",
  },
  {
    title: "Impact score",
    status: "A-",
    badgeClass: "bg-[#2563EB]",
    badgeTextClass: "text-white",
    body: "Strong delivery confidence.",
  },
  {
    title: "Recent proof",
    status: "Feb 12, 2026",
    badgeClass: "bg-[#E5E7EB]",
    badgeTextClass: "text-[#0F172A]",
    body: "Receipts and field photos uploaded.",
  },
];

const faqs = [
  {
    id: "faq-1",
    question: "How does milestone escrow work?",
    answer:
      "Funds are held until proof is uploaded and reviewed. Each release is logged in the public audit trail.",
  },
  {
    id: "faq-2",
    question: "Can I donate without an account?",
    answer: "Yes. Guest donations require only an email for receipts and updates.",
  },
  {
    id: "faq-3",
    question: "What happens if a milestone fails?",
    answer:
      "Releases pause. The campaign must submit a revised plan or refunds are offered based on policy.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

type TabKey = (typeof tabs)[number];

type ProfileSummary = {
  email: string;
  name: string;
  id: string;
  subaccount: string;
};

type Donor = {
  id: string;
  name?: string | null;
  amount?: number | null;
  created_at?: string | null;
};

type CauseDetail = Cause & {
  user: {
    name: string;
    email: string;
    sub_account_code?: string | null;
  };
  sections?: { heading: string; description: string }[];
  summary?: string | null;
  location?: string | null;
};

type CampaignQualityLabProps = {
  cause: CauseDetail;
  donors: Donor[];
  commentsCount: number;
  profile: ProfileSummary;
  creatorHasWallet: boolean;
  isDemo?: boolean;
};

function StatItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
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

function HeaderMeta({
  status,
  formattedDate,
  isDemo,
}: {
  status: string;
  formattedDate: string;
  isDemo?: boolean;
}) {
  return (
    <motion.div className="space-y-2" variants={fadeUp}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] sm:hidden">
        {isDemo && (
          <span className="rounded-full border border-[#E5E7EB] bg-[#0F172A] px-3 py-1 text-xs font-semibold text-white">
            Demo mode
          </span>
        )}
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold text-[#0F172A]">
          <ShieldCheck className="h-4 w-4" />
          {status === "approved" ? "Verified" : "In review"}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold text-[#0F172A]">
          <BadgeCheck className="h-4 w-4 text-[#2563EB]" />
          Trust A-
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold text-[#0F172A]">
          <CalendarClock className="h-4 w-4 text-[#64748B]" />
          {formattedDate}
        </span>
      </div>

      <div className="hidden flex-wrap items-center gap-3 text-xs text-[#64748B] sm:flex sm:text-sm">
        {isDemo && (
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#0F172A] px-4 py-2 font-semibold text-white shadow-sm">
            Demo mode
          </div>
        )}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 font-semibold text-[#0F172A] shadow-sm">
          <ShieldCheck className="h-5 w-5" />
          <span>{status === "approved" ? "Verified" : "In review"}</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 font-medium text-[#0F172A] shadow-sm">
          <BadgeCheck className="h-5 w-5 text-[#2563EB]" />
          <span className="uppercase tracking-[0.2em] text-[10px] text-slate-400">Trust</span>
          <span className="rounded-full bg-[#2563EB] px-2.5 py-0.5 text-xs font-semibold text-white">
            A-
          </span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 font-medium text-[#0F172A] shadow-sm">
          <CalendarClock className="h-5 w-5 text-[#64748B]" />
          <span className="uppercase tracking-[0.2em] text-[10px] text-[#64748B]">
            Updated
          </span>
          <span className="text-sm font-semibold text-[#0F172A]">{formattedDate}</span>
        </div>
      </div>
    </motion.div>
  );
}

function HeroSummary({ cause, donorsCount }: { cause: CauseDetail; donorsCount: number }) {
  return (
    <motion.div className="flex flex-col gap-4" variants={fadeUp}>
      <h1 className="text-2xl font-semibold leading-snug tracking-tight text-[#0F172A] sm:text-3xl lg:text-5xl">
        {cause.title}
      </h1>
      <p className="text-sm leading-relaxed text-[#64748B] sm:text-base lg:text-lg">
        {cause.summary ||
          "Verified, milestone-based relief with evidence-locked releases and transparent updates."}
      </p>
      <div className="flex flex-wrap items-center gap-3 text-sm text-[#64748B] sm:gap-4 sm:text-sm">
        <span className="inline-flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#2563EB]" />
          {cause.location || "Location on request"}
        </span>
        <span className="inline-flex items-center gap-2">
          <Users className="h-4 w-4 text-[#2563EB]" />
          {donorsCount} supporters
        </span>
        <span className="inline-flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#2563EB]" />
          Worldwide donors welcome
        </span>
      </div>
    </motion.div>
  );
}

function TrustPanel({ baseUrl, cause }: { baseUrl: string; cause: CauseDetail }) {
  const proofMedia = useMemo(() => {
    if (cause.multimedia && cause.multimedia.length > 0) return cause.multimedia;
    if (cause.image) return [cause.image];
    return [];
  }, [cause.image, cause.multimedia]);

  return (
    <motion.div
      className="rounded-[14px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-[#64748B]">
            Trust strip
          </p>
          <p className="mt-1 text-sm text-[#64748B]">
            Verified releases with evidence checkpoints.
          </p>
        </div>
        <ShareModal
          url={`${baseUrl}/causes/${cause.id}`}
          title={cause.title}
          entityId={cause.id}
          entityType="cause"
        />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-[#64748B] sm:grid-cols-2">
        {trustTiles.map((tile) => (
          <div
            key={tile.title}
            className="rounded-[14px] border border-[#E5E7EB] bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.15em] text-[#64748B]">
                {tile.title}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tile.badgeClass} ${tile.badgeTextClass}`}
              >
                {tile.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-[#64748B]">{tile.body}</p>
          </div>
        ))}
      </div>

      {proofMedia.length > 0 && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.15em] text-[#64748B]">Latest proof</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {proofMedia.slice(0, 3).map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
              >
                <img
                  src={item}
                  alt="Proof"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ImpactCard() {
  return (
    <motion.div
      className="rounded-[14px] border border-[#E5E7EB] bg-white p-4 text-sm text-[#64748B] shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-6"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <p className="text-xs uppercase tracking-[0.15em] text-[#64748B]">Impact in 3 bullets</p>
      <div className="mt-3 grid gap-2">
        {impactBullets.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function StatsRow({ cause, donorsCount }: { cause: CauseDetail; donorsCount: number }) {
  return (
    <motion.div className="grid gap-3 sm:gap-4 sm:grid-cols-3" variants={fadeUp}>
      <StatItem
        icon={<Target className="h-4 w-4" />}
        label="Raised"
        value={`₦${cause.raised.toLocaleString()} of ₦${cause.goal.toLocaleString()}`}
      />
      <StatItem icon={<Users className="h-4 w-4" />} label="Supporters" value={`${donorsCount}`} />
      <StatItem
        icon={<CalendarClock className="h-4 w-4" />}
        label="Days left"
        value={`${cause.days_active}`}
      />
    </motion.div>
  );
}

function MediaCard({ media, cause }: { media: string[]; cause: CauseDetail }) {
  return (
    <motion.div
      className="overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {media.length > 0 ? (
        <MultimediaCarousel media={media} coverImage={cause.image || undefined} title={cause.title} />
      ) : (
        <div className="flex h-64 items-center justify-center bg-slate-100 text-slate-400">
          <ImageIcon className="h-6 w-6" />
        </div>
      )}
    </motion.div>
  );
}

function ProgressCard({
  cause,
  percentRaised,
  remainingGoal,
}: {
  cause: CauseDetail;
  percentRaised: number;
  remainingGoal: number;
}) {
  return (
    <motion.div
      className="rounded-[14px] border border-[#E5E7EB] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-6"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Progress</p>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {percentRaised}% funded
        </span>
      </div>
      <div className="mt-4 flex items-end gap-3">
        <p className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          ₦{cause.raised.toLocaleString()}
        </p>
        <p className="text-sm text-slate-500">
          raised of ₦{cause.goal.toLocaleString()}
        </p>
      </div>
      <div className="mt-4">
        <Progress value={percentRaised} />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
        <span>{percentRaised}% raised</span>
        <span>₦{remainingGoal.toLocaleString()} remaining</span>
      </div>
    </motion.div>
  );
}

function TabsCard({
  cause,
  formattedDate,
  commentsCount,
  activeTab,
  setActiveTab,
}: {
  cause: CauseDetail;
  formattedDate: string;
  commentsCount: number;
  activeTab: TabKey;
  setActiveTab: (value: TabKey) => void;
}) {
  return (
    <motion.div
      className="rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="border-b border-slate-200 px-3 py-3 sm:px-4">
        <select
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 sm:hidden"
          value={activeTab}
          onChange={(event) => setActiveTab(event.target.value as TabKey)}
        >
          {tabs.map((tab) => (
            <option key={tab} value={tab}>
              {tab}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden items-center gap-2 overflow-x-auto border-b border-slate-200 px-3 py-3 sm:flex sm:px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 sm:px-4 sm:py-2 sm:text-xs ${
              activeTab === tab
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
            aria-pressed={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6">
        {activeTab === "Story" && (
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Created by</span>
              <span className="font-medium text-slate-800">{cause.user.name}</span>
              <span className="text-slate-300">•</span>
              <span className="capitalize">{cause.category}</span>
              <span className="text-slate-300">•</span>
              <span>{formattedDate}</span>
            </div>
            {cause.sections && cause.sections.length > 0 ? (
              <StorySections sections={cause.sections} />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No story sections yet. Add campaign milestones and evidence to build trust.
              </div>
            )}
          </div>
        )}

        {activeTab === "Milestones" && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Milestones are not yet configured for this campaign. Add milestone proof to unlock
            escrowed releases.
          </div>
        )}

        {activeTab === "Updates" && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            No updates yet. The organiser will post timeline updates here.
          </div>
        )}

        {activeTab === "Budget" && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Budget breakdown will appear once provided by the organiser.
          </div>
        )}

        {activeTab === "Comments" && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MessagesSquare className="h-4 w-4 text-emerald-500" />
              {commentsCount} comments
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Comments are moderated and rate-limited. Visit the live cause page to participate.
            </p>
          </div>
        )}

        {activeTab === "FAQ" && (
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <details key={faq.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-900">
                  {faq.question}
                  <ChevronDown className="h-4 w-4" />
                </summary>
                <p className="mt-3 text-sm text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DonateCard({
  cause,
  donation,
  setDonation,
  recurring,
  setRecurring,
  tip,
  setTip,
  totalWithTip,
  impactText,
  profile,
  creatorHasWallet,
}: {
  cause: CauseDetail;
  donation: number;
  setDonation: (value: number) => void;
  recurring: boolean;
  setRecurring: (value: boolean | ((prev: boolean) => boolean)) => void;
  tip: number;
  setTip: (value: number) => void;
  totalWithTip: number;
  impactText: string;
  profile: ProfileSummary;
  creatorHasWallet: boolean;
}) {
  return (
    <motion.div
      className="rounded-[14px] border border-[#E5E7EB] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-6"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Donate</p>
        <HandHeart className="h-4 w-4 text-[#2563EB]" />
      </div>

      <h3 className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl">
        Make a contribution
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        Rewards only apply to verified campaigns. Every milestone release is publicly audited.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {donationPresets.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => setDonation(amount)}
            className={`rounded-full border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${
              donation === amount
                ? "border-[#2563EB] bg-[#2563EB] text-white"
                : "border-[#E5E7EB] bg-white text-[#64748B]"
            }`}
          >
            ₦{amount.toLocaleString()}
          </button>
        ))}
      </div>

      <label className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
        <span className="text-xs uppercase tracking-[0.15em] text-slate-500">
          Custom amount
        </span>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <span className="text-sm font-semibold text-slate-500">₦</span>
          <input
            type="number"
            min={1}
            value={donation}
            onChange={(event) => setDonation(Number(event.target.value))}
            className="w-full bg-transparent text-right text-sm text-slate-900 outline-none"
          />
        </div>
        <p className="text-xs text-slate-500">Enter any amount above ₦1.</p>
      </label>

      <div className="mt-4 grid gap-3">
        <label className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-xs text-[#64748B]">
          <span>Make this monthly</span>
          <button
            type="button"
            onClick={() => setRecurring((prev) => !prev)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${
              recurring
                ? "bg-[#2563EB] text-white"
                : "border border-[#E5E7EB] bg-white text-[#64748B]"
            }`}
          >
            {recurring ? "Monthly" : "One-time"}
          </button>
        </label>

        <label className="grid gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-xs text-[#64748B]">
          <span>Platform tip</span>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
            {tipPresets.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTip(value)}
                className={`rounded-full px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${
                  tip === value
                    ? "bg-[#2563EB] text-white"
                    : "border border-[#E5E7EB] bg-white text-[#64748B]"
                }`}
              >
                ₦{value.toLocaleString()}
              </button>
            ))}
          </div>
        </label>
      </div>

      <div className="mt-4 rounded-[14px] border border-[#E5E7EB] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <p className="text-xs uppercase tracking-[0.15em] text-[#64748B]">Impact estimate</p>
        <p className="mt-2 text-sm text-[#0F172A]">{impactText}</p>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-[#64748B]">
        <span>Total today</span>
        <span className="text-[#0F172A]">₦{totalWithTip}</span>
      </div>

      <div className="mt-4 space-y-3">
        {creatorHasWallet && <SolanaDonationButtonWrapper causeId={cause.id} />}
        <DonationForm
          causeId={cause.id}
          profile={profile}
          status={cause.status}
          subaccount={cause?.user.sub_account_code}
          causeName={cause.title}
          causeUrl={`/causes/${cause.id}`}
        />
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-[#64748B]">
        <ShieldAlert className="mt-0.5 h-4 w-4 text-[#F59E0B]" />
        Donations below ₦5 do not earn EIZA. Refunds or chargebacks remove rewards.
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-xs text-[#64748B]">
        <span>Guest checkout</span>
        <span className="text-[#22C55E]">Enabled</span>
      </div>
    </motion.div>
  );
}

function CampaignHealthCard({
  donorsPreview,
}: {
  donorsPreview: { id: string; name: string; amount: number }[];
}) {
  return (
    <motion.div
      className="rounded-[14px] border border-[#E5E7EB] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-6"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Campaign health</p>
        <Target className="h-4 w-4 text-rose-500" />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Auto prompts trigger when momentum dips or the goal nears completion.
      </p>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Recent donors</p>
        <Share2 className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-3 grid gap-3 text-sm text-slate-600">
        {donorsPreview.length > 0 ? (
          donorsPreview.map((donor) => (
            <div key={donor.id} className="flex items-center justify-between">
              <span>{donor.name}</span>
              <span className="text-emerald-600">₦{Number(donor.amount).toLocaleString()}</span>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-500">Be the first to donate.</div>
        )}
      </div>
      <button
        type="button"
        className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs uppercase tracking-[0.15em] text-slate-600"
      >
        Follow campaign
      </button>
    </motion.div>
  );
}

function StorySections({ sections }: { sections: { heading: string; description: string }[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? sections : sections.slice(0, 2);

  return (
    <div className="space-y-4">
      {visible.map((section, index) => (
        <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">{section.heading}</p>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
            {section.description}
          </p>
        </div>
      ))}
      {sections.length > 2 && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-sm font-semibold text-slate-700 underline underline-offset-4"
        >
          {expanded ? "Show less" : "Read full story"}
        </button>
      )}
    </div>
  );
}

export default function CampaignQualityLab({
  cause,
  donors,
  commentsCount,
  profile,
  creatorHasWallet,
  isDemo,
}: CampaignQualityLabProps) {
  const [donation, setDonation] = useState(25);
  const [activeTab, setActiveTab] = useState<TabKey>("Story");
  const [recurring, setRecurring] = useState(false);
  const [tip, setTip] = useState(5);
  const donateRef = useRef<HTMLDivElement | null>(null);

  const percentRaised = useMemo(() => {
    if (!cause.goal) return 0;
    return Math.min(Math.round((cause.raised / cause.goal) * 100), 100);
  }, [cause.goal, cause.raised]);

  const formattedDate = useMemo(
    () =>
      new Date(cause.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [cause.created_at]
  );

  const impactText = useMemo(() => {
    if (donation >= 100) return "Covers 2 family kits + transport";
    if (donation >= 50) return "Funds 1 family kit";
    if (donation >= 25) return "Supplies 3 hygiene packs";
    return "Supports immediate relief";
  }, [donation]);

  const totalWithTip = useMemo(() => donation + tip, [donation, tip]);
  const remainingGoal = useMemo(
    () => Math.max(cause.goal - cause.raised, 0),
    [cause.goal, cause.raised]
  );

  const donorsPreview = useMemo(
    () =>
      donors
        .slice(0, 5)
        .map((donor) => ({
          id: donor.id,
          name: donor.name || "Anonymous",
          amount: donor.amount || 0,
        })),
    [donors]
  );

  const media = useMemo(() => {
    const items = [...(cause.multimedia || []), ...(cause.video_links || [])];
    if (items.length > 0) return items;
    if (cause.image) return [cause.image];
    return [];
  }, [cause.image, cause.multimedia, cause.video_links]);

  const baseUrl = getBaseURL();

  return (
    <div
      className="min-h-screen bg-[#F6F8FB] pt-10 text-[#0F172A] sm:pt-14"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 20%, rgba(37,99,235,0.08), transparent 60%)",
      }}
    >
      <div className="border-b border-[#E5E7EB] bg-white">
        <div className="container px-4 py-4 sm:py-6">
          <motion.div className="flex flex-col gap-5 sm:gap-6" variants={stagger} initial="hidden" animate="show">
            <HeaderMeta status={cause.status} formattedDate={formattedDate} isDemo={isDemo} />

            <motion.div className="grid gap-6" variants={stagger}>
              <HeroSummary cause={cause} donorsCount={donors.length} />
            </motion.div>

            <StatsRow cause={cause} donorsCount={donors.length} />
          </motion.div>
        </div>
      </div>

      <main className="container grid gap-6 px-4 pb-24 pt-6 sm:py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6 lg:col-start-1 lg:col-end-2">
          <MediaCard media={media} cause={cause} />
          <ProgressCard cause={cause} percentRaised={percentRaised} remainingGoal={remainingGoal} />
          <ImpactCard />
          <TrustPanel baseUrl={baseUrl} cause={cause} />
          <motion.div
            className="rounded-[14px] border border-[#E5E7EB] bg-white p-4 text-sm text-slate-600 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-6"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
              What happened and the solution
            </p>
            <p className="mt-3">
              Flooding started after weeks of record rainfall, washing away homes and essential
              infrastructure. The solution is a phased rebuild: emergency shelter now, permanent
              housing next, and evidence-verified releases at every milestone.
            </p>
          </motion.div>
        </section>

        <aside className="space-y-6 lg:col-start-2 lg:row-span-2">
          <div className="space-y-6 lg:sticky lg:top-24">
            <div ref={donateRef}>
              <DonateCard
                cause={cause}
                donation={donation}
                setDonation={setDonation}
                recurring={recurring}
                setRecurring={setRecurring}
                tip={tip}
                setTip={setTip}
                totalWithTip={totalWithTip}
                impactText={impactText}
                profile={profile}
                creatorHasWallet={creatorHasWallet}
              />
            </div>
            <CampaignHealthCard donorsPreview={donorsPreview} />
          </div>
        </aside>

        <section className="lg:col-start-1 lg:col-end-2">
          <TabsCard
            cause={cause}
            formattedDate={formattedDate}
            commentsCount={commentsCount}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] sm:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            type="button"
            onClick={() => {
              donateRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            Donate
          </button>
        </div>
      </div>
    </div>
  );
}
