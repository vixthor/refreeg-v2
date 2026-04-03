"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  CheckCircle,
  TrendingUp,
  Heart,
  FileText,
  Users,
  Globe,
  HandCoins,
} from "lucide-react";
import { DonationCard, EmptyState } from "./ProfileCards";
import { ExpandableCard } from "./ExpandableCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryState } from "nuqs";
import { HandHeart, ShieldAlert } from "lucide-react";

type ProfileProps = {
  profile: any;
  causes: any[];
  donations: any[];
  petitions: any[];
  userId: string;
  isOwner: boolean;
};

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(1)}K`;
  }
  return `₦${amount.toLocaleString()}`;
}

function formatCount(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function PublicProfile({
  profile,
  causes,
  donations,
  petitions,
  userId,
  isOwner,
}: ProfileProps) {
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "causes",
    shallow: false,
  });

  const donationsCount = donations.length;
  const causesCount = causes.length;
  const petitionsCount = petitions.length;

  // Computed impact metrics
  const totalRaisedAcrossCauses = causes.reduce(
    (sum, c) => sum + (c.raised || 0),
    0
  );
  const totalDonated = donations.reduce(
    (sum, d) => sum + (d.amount || 0),
    0
  );
  const totalSignaturesGathered = petitions.reduce(
    (sum, p) => sum + (p.signatures || p.signature_count || 0),
    0
  );
  const activeCauses = causes.filter(
    (c) => !c.ended && (c.raised || 0) < (c.goal || 1)
  ).length;

  const isVerified = profile.is_verified || false;

  const handleBack = () => {
    window.history.back();
  };

  const defaultProfileImage = "/default-avatar.jpg";
  const profileImage = profile.profile_photo || defaultProfileImage;
  const displayName = profile.full_name || "Anonymous";
  const username = profile.username || "";
  const firstName = displayName.split(" ")[0] || "this user";

  const impactMetrics = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Total Raised",
      value: formatCurrency(totalRaisedAcrossCauses),
      sub: `across ${causesCount} ${causesCount === 1 ? "cause" : "causes"}`,
      color: "text-[#003366]",
      bg: "bg-[#003366]/5",
      border: "border-[#003366]/10",
    },
    {
      icon: <HandCoins className="h-5 w-5" />,
      label: "Donated",
      value: formatCurrency(totalDonated),
      sub: `${donationsCount} ${donationsCount === 1 ? "contribution" : "contributions"}`,
      color: "text-[#1A7499]",
      bg: "bg-[#1A7499]/5",
      border: "border-[#1A7499]/10",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Petition Signatures",
      value: formatCount(totalSignaturesGathered),
      sub: `from ${petitionsCount} ${petitionsCount === 1 ? "petition" : "petitions"}`,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      label: "Active Causes",
      value: String(activeCauses),
      sub: "currently fundraising",
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-100",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Brand banner */}
      <div className="w-full h-36 md:h-48 bg-gradient-to-r from-[#003366] via-[#004d99] to-[#1A7499] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute bottom-4 left-4 md:left-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        {/* RefreeG brand tag */}
        <Link href="https://t.me/+d67UCIer8c01ODhk" className="absolute top-4 right-4 md:right-8 flex items-center gap-1.5 text-white/60 text-xs font-semibold tracking-widest uppercase">
          <Users className="h-3.5 w-3.5" />
          <span>RefreeG Community</span>
        </Link >
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 -mt-12 md:-mt-16 relative z-10 px-6 pt-6 pb-6 md:px-10">
          <div className="flex flex-col md:flex-row gap-5 items-start">
            {/* Avatar */}
            <div className="relative -mt-12 md:-mt-16 shrink-0">
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
                <Image
                  src={profileImage}
                  alt={`${displayName}'s profile picture`}
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = defaultProfileImage;
                  }}
                />
              </div>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
                  <CheckCircle className="h-6 w-6 text-[#003366] fill-blue-100" />
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0 pt-1 md:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-[#003366] tracking-tight">
                  {displayName}
                </h1>
                {isVerified && (
                  <CheckCircle className="h-5 w-5 text-[#003366] fill-blue-100 shrink-0" />
                )}
              </div>

              {username && (
                <p className="text-gray-400 text-sm mt-0.5">@{username}</p>
              )}

              {isVerified && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-[#003366]/5 text-[#003366] text-xs font-semibold rounded-full border border-[#003366]/10">
                  <CheckCircle className="h-3 w-3" />
                  <span>Verified RefreeGerian</span>
                </div>
              )}

              {profile.bio && (
                <p className="mt-3 text-gray-600 text-sm leading-relaxed max-w-xl">
                  {profile.bio}
                </p>
              )}
              {!profile.bio && (
                <p className="mt-3 text-gray-400 text-sm italic">
                  No bio yet — empowering communities one step at a time.
                </p>
              )}
            </div>

            {/* CTA for non-owners */}
            {!isOwner && (
              <div className="shrink-0 mt-2 md:mt-0">
                <Link href="/causes">
                  <Button
                    size="sm"
                    className="bg-[#003366] hover:bg-[#004080] text-white text-xs font-semibold px-4"
                  >
                    <Heart className="h-3.5 w-3.5 mr-1.5" />
                    Support a Cause
                  </Button>
                </Link>
              </div>
            )}
            <Link href="/causes" className="shrink-0 mt-2 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-500 hover:text-gray-700 border-gray-300 hover:bg-gray-100 gap-x-1"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
              >
                <HandHeart className="h-4 w-4 text-grey-500" />
                Pledge
              </Button>
            </Link>
          </div>
        </div>

        {/* Impact metrics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {impactMetrics.map((metric) => (
            <div
              key={metric.label}
              className={`rounded-xl border ${metric.border} ${metric.bg} p-4 flex flex-col gap-2`}
            >
              <div className={`${metric.color}`}>{metric.icon}</div>
              <div>
                <p className={`text-xl font-bold ${metric.color} leading-none`}>
                  {metric.value}
                </p>
                <p className="text-xs font-semibold text-gray-700 mt-1">
                  {metric.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{metric.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Impact tagline */}
        <div className="mt-4 flex items-center gap-2 px-1">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#003366]/20 to-transparent" />
          <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
            Socio-Economic Impact
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#003366]/20 to-transparent" />
        </div>

        {/* Tabs */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <div className="border-b border-gray-100 px-2">
              <TabsList className="bg-transparent p-0 gap-0 h-auto">
                <TabsTrigger
                  value="causes"
                  className="px-5 py-3.5 font-semibold text-sm flex items-center gap-2 data-[state=active]:text-[#003366] data-[state=active]:border-b-2 data-[state=active]:border-[#003366] data-[state=active]:shadow-none text-gray-400 hover:text-gray-600 rounded-none transition-colors"
                >
                  <TrendingUp className="h-4 w-4" />
                  Causes
                  {causesCount > 0 && (
                    <span className="text-xs bg-[#003366]/10 text-[#003366] px-1.5 py-0.5 rounded-full font-bold">
                      {causesCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="donations"
                  className="px-5 py-3.5 font-semibold text-sm flex items-center gap-2 data-[state=active]:text-[#003366] data-[state=active]:border-b-2 data-[state=active]:border-[#003366] data-[state=active]:shadow-none text-gray-400 hover:text-gray-600 rounded-none transition-colors"
                >
                  <HandCoins className="h-4 w-4" />
                  Donations
                  {donationsCount > 0 && (
                    <span className="text-xs bg-[#003366]/10 text-[#003366] px-1.5 py-0.5 rounded-full font-bold">
                      {donationsCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="petitions"
                  className="px-5 py-3.5 font-semibold text-sm flex items-center gap-2 data-[state=active]:text-[#003366] data-[state=active]:border-b-2 data-[state=active]:border-[#003366] data-[state=active]:shadow-none text-gray-400 hover:text-gray-600 rounded-none transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Petitions
                  {petitionsCount > 0 && (
                    <span className="text-xs bg-[#003366]/10 text-[#003366] px-1.5 py-0.5 rounded-full font-bold">
                      {petitionsCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 md:p-6">
              <TabsContent value="causes">
                {causesCount === 0 ? (
                  <EmptyState
                    title="No Causes Yet"
                    description={`It looks like ${firstName} hasn't started a cause yet. Stay tuned for their first impact story!`}
                    cta="Explore causes on RefreeG"
                    ctaLink="/causes"
                  />
                ) : (
                  <ExpandableCard
                    items={causes.map((cause) => ({
                      id: cause.id,
                      title: cause.title,
                      description: cause.description,
                      image: cause.image,
                      goal: cause.goal || 0,
                      raised: cause.raised || 0,
                      category: cause.category || "Cause",
                      sections: cause.sections || [],
                    }))}
                    type="cause"
                  />
                )}
              </TabsContent>
              <TabsContent value="donations">
                {donationsCount === 0 ? (
                  <EmptyState
                    title="No Donations Yet"
                    description={`${firstName} hasn't donated to any causes yet.`}
                    cta="Explore causes on RefreeG"
                    ctaLink="/causes"
                  />
                ) : (
                  <div className="space-y-3 w-full">
                    {donations.map((donation) => (
                      <DonationCard key={donation.id} donation={donation} />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="petitions">
                {petitionsCount === 0 ? (
                  <EmptyState
                    title="No Petitions Yet"
                    description={`${firstName} hasn't created any petitions yet.`}
                    cta="Explore petitions on RefreeG"
                    ctaLink="/petitions"
                  />
                ) : (
                  <ExpandableCard
                    items={petitions.map((petition) => ({
                      id: petition.id,
                      title: petition.title,
                      description: petition.description,
                      image: petition.image,
                      goal: petition.goal || 0,
                      signatures: petition.signatures || 0,
                      category: petition.category || "Petition",
                      sections: petition.sections || [],
                    }))}
                    type="petition"
                  />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
