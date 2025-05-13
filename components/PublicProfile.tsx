// components/profile/PublicProfile.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import ProfileTabs from "./ProfileTabs";
import { CauseCard, DonationCard, EmptyState } from "./ProfileCards";

type ProfileProps = {
  profile: any;
  causes: any[];
  donations: any[];
  userId: string;
  activeTab: string;
  isOwner: boolean;
};

export default function PublicProfile({
  profile,
  causes,
  donations,
  userId,
  activeTab,
  isOwner,
}: ProfileProps) {
  const router = useRouter();
  const donationsCount = donations.length;

  const handleBack = () => {
    router.back();
  };

  // Tab configuration
  const tabs = [
    {
      id: "causes",
      label: "Causes",
      count: causes.length,
      content:
        causes.length === 0 ? (
          <EmptyState
            title="No Causes Yet"
            description={`It looks like ${
              profile.full_name?.split(" ")[0] || "this user"
            } hasn't started a cause yet. Stay tuned for their first impact story!`}
            cta="Explore causes on refreeg"
            ctaLink="/causes"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {causes.map((cause) => (
              <CauseCard key={cause.id} cause={cause} />
            ))}
          </div>
        ),
    },
    {
      id: "donations",
      label: "Donations",
      count: donationsCount,
      content:
        donationsCount === 0 ? (
          <EmptyState
            title="No Donations Yet"
            description={`${
              profile.full_name?.split(" ")[0] || "This user"
            } hasn't donated to any causes yet.`}
            cta="Explore causes on refreeg"
            ctaLink="/causes"
          />
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => (
              <DonationCard key={donation.id} donation={donation} />
            ))}
          </div>
        ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
          <Image
            src={profile.profile_photo || "/default-avatar.png"}
            alt={`${profile.full_name}'s profile`}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex-1">
          <div>
            <h1 className="text-2xl font-bold">
              {profile.full_name || "Anonymous"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                📌 Individual
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4 text-sm">
            <span className="text-gray-700">
              <span className="font-semibold">{causes.length}</span>{" "}
              {causes.length === 1 ? "cause" : "causes"}
            </span>
            <span className="text-gray-700">
              <span className="font-semibold">{donationsCount}</span>{" "}
              {donationsCount === 1 ? "donation" : "donations"}
            </span>
          </div>

          {/* Bio */}
          <p className="mt-4 text-gray-700">{profile.bio || "No Bio Yet"}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <ProfileTabs tabs={tabs} userId={userId} activeTab={activeTab} />

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
