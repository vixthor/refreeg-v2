"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { CauseCard, DonationCard, EmptyState } from "./ProfileCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  activeTab = "causes", // default value
  isOwner,
}: ProfileProps) {
  const router = useRouter();
  const donationsCount = donations.length;
  const causesCount = causes.length;

  const handleBack = () => {
    router.back();
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    router.push(`/profile/${userId}?tab=${value}`, { scroll: false });
  };

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
            {/* <div className="flex items-center gap-2 mt-1">
              <span className="text-sm bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                📌 Individual
              </span>
            </div> */}
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4 text-sm">
            <span className="text-gray-700">
              <span className="font-semibold">{causesCount}</span>{" "}
              {causesCount === 1 ? "cause" : "causes"}
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

      {/* Custom-styled shadcn Tabs */}
      <div className="border-b mt-8">
        <Tabs
          defaultValue={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="flex justify-center">
            <TabsList className="bg-transparent p-0 gap-0">
              <TabsTrigger
                value="causes"
                className="px-6 py-2 font-medium flex items-center gap-2 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none text-gray-500 hover:text-gray-700 rounded-none"
              >
                Causes
                {causesCount > 0 && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {causesCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="donations"
                className="px-6 py-2 font-medium flex items-center gap-2 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none text-gray-500 hover:text-gray-700 rounded-none"
              >
                Donations
                {donationsCount > 0 && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {donationsCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="mt-6">
            <TabsContent value="causes">
              {causesCount === 0 ? (
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
              )}
            </TabsContent>
            <TabsContent value="donations">
              {donationsCount === 0 ? (
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
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
