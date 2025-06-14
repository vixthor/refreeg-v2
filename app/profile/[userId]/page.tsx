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
}: {
  params: PageParams;
}) {
  // Properly await the params destructuring
  const { userId } = await params;

  // Destructure searchParams

  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === userId;

  // Fetch data
  const profile = await getProfile(userId);
  if (!profile) {
    return <div className="text-center py-12">User not found</div>;
  }

  const causes = await getUserCauses(userId);
  const donations = await listUserDonations(userId);

  return (
    <div className="relative">
      <PublicProfile
        profile={profile}
        causes={causes}
        donations={donations}
        userId={userId}
        isOwner={isOwner}
      />
    </div>
  );
}