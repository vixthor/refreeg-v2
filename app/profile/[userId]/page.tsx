// app/profile/[userId]/page.tsx
import { getProfile, getUserCauses, listUserDonations } from "@/actions";
import { getCurrentUser } from "@/actions/auth-actions";
import PublicProfile from "@/components/PublicProfile";
import Link from "next/link";

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

  // Destructure searchParams after declaring the component as async
  const tabParam = searchParams.tab;

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

  return (
    <div className="relative">
      {/* Construction Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">This feature is under construction</h2>
          <p className="text-gray-600 mb-4">We're working on bringing you user profiles soon!</p>
          <p className="text-gray-600">This page cannot be accessed at this time.</p>
          <Link href="/" className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Go Back
          </Link>
        </div>
      </div>

      {/* Original content (still rendered but hidden behind the modal) */}
      <PublicProfile
        profile={profile}
        causes={causes}
        donations={donations}
        userId={userId}
        activeTab={activeTab}
        isOwner={isOwner}
      />
    </div>
  );
}
