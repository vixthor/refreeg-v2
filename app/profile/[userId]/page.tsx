// app/profile/[userId]/page.tsx
import { getProfile, getUserCauses, listUserDonations } from "@/actions";
import { getCurrentUser } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

// Type definitions for our parameters
type PageParams = {
  userId: string;
};

type SearchParams = {
  tab?: string;
};

export default async function PublicProfilePage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: SearchParams;
}) {
  // Properly handle the params as recommended by Next.js
  const { userId } = params;
  const { tab: tabParam } = searchParams;

  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === userId;
  const activeTab = tabParam || "causes";

  // Fetch data
  const profile = await getProfile(userId);
  if (!profile) {
    return <div className="text-center py-12">User not found</div>;
  }

  const causes = await getUserCauses(userId);
  const donations = await listUserDonations(userId);
  const donationsCount = donations.length;

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
      <BackButton />
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
      <div className="border-b mt-8">
        <div className="flex justify-center">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/profile/${userId}?tab=${tab.id}`}
              className={`px-6 py-2 font-medium flex items-center gap-2 ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}

// Component for empty states
function EmptyState({
  title,
  description,
  cta,
  ctaLink,
}: {
  title: string;
  description: string;
  cta: string;
  ctaLink: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-500 max-w-md mx-auto">{description}</p>
      <Button className="mt-4" asChild>
        <Link href={ctaLink}>{cta}</Link>
      </Button>
    </div>
  );
}

// Component for cause cards
function CauseCard({ cause }: { cause: any }) {
  const progressPercentage = Math.min(
    Math.round((cause.raised / cause.goal) * 100),
    100
  );

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/causes/${cause.id}`}>
        <div className="aspect-video relative bg-gray-100">
          <Image
            src={cause.image || "/placeholder-cause.jpg"}
            alt={cause.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="text-xs px-2 py-1 rounded-full"
            >
              {cause.category}
            </Badge>
          </div>
          <h3 className="font-medium line-clamp-2">{cause.title}</h3>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                ₦{cause.raised.toLocaleString()}
              </span>
              <span className="text-gray-500">
                of ₦{cause.goal.toLocaleString()}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-gray-200" />
            <div className="text-xs text-gray-500 text-right">
              {progressPercentage}% funded
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// Component for donation cards
function DonationCard({ donation }: { donation: any }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between">
        <div>
          <p className="font-medium">₦{donation.amount.toLocaleString()}</p>
          <p className="text-sm text-gray-500">
            {new Date(donation.created_at).toLocaleDateString()}
          </p>
        </div>
        {donation.cause_id && (
          <Link
            href={`/causes/${donation.cause_id}`}
            className="text-blue-600 hover:underline text-sm"
          >
            View Cause
          </Link>
        )}
      </div>
      {donation.message && (
        <p className="mt-2 text-sm italic">"{donation.message}"</p>
      )}
    </div>
  );
}
