// app/profile/[username]/page.tsx
import {
  getProfile,
  getUserCauses,
  listUserDonations,
  getUserPetitions,
  getProfileByUsername, // You'll need to create this function
} from "@/actions";
import { getCurrentUser } from "@/actions/auth-actions";
import PublicProfile from "@/components/PublicProfile";

// Type definitions for our parameters
type PageParams = {
  username: string;
};

type SearchParams = {
  tab?: string;
};

export default async function PublicProfilePage({
  params,
}: {
  params: PageParams;
}) {
  const { username } = await params;

  const currentUser = await getCurrentUser();
  
  // Fetch profile by username instead of userId
  const profile = await getProfileByUsername(username);
  if (!profile) {
    return <div className="text-center py-12">User not found</div>;
  }

  const userId = profile.id; // Use the actual user ID for subsequent queries
  const isOwner = currentUser?.id === userId;

  // Fetch data using the actual user ID
  const causes = await getUserCauses(userId).then((causes) =>
    causes.filter((cause) => cause.status === "approved")
  );
  const donations = await listUserDonations(userId).then((donations) =>
    donations.filter(
      (donation) => (donation.cause as any)?.status === "approved"
    )
  );
  const petitions = await getUserPetitions(userId).then((petitions) =>
    petitions.filter((petition) => petition.status === "approved")
  );

  return (
    <div className="relative">
      <PublicProfile
        profile={profile}
        causes={causes}
        donations={donations}
        petitions={petitions}
        userId={userId}
        isOwner={isOwner}
      />
    </div>
  );
}