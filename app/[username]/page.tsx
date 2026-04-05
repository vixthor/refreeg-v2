import { getProfile, getProfileByUsername } from "@/actions/profile-actions";
import { getUserCauses } from "@/actions/cause-actions";
import { listUserDonations } from "@/actions/donation-actions";
import { getUserPetitions } from "@/actions/petition-actions";
import { getCurrentUser } from "@/actions/auth-actions";
import PublicProfile from "@/components/PublicProfile";
import { notFound } from "next/navigation";

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

  const profile = await getProfileByUsername(username);
  if (!profile) {
    notFound();
  }

  const userId = profile.id;
  const isOwner = currentUser?.id === userId;

  const causes = await getUserCauses(userId).then((causes) =>
    causes.filter((cause) => cause.status === "approved"),
  );
  const donations = await listUserDonations(userId).then((donations) =>
    donations.filter(
      (donation) => (donation.cause as any)?.status === "approved",
    ),
  );
  const petitions = await getUserPetitions(userId).then((petitions) =>
    petitions.filter((petition) => petition.status === "approved"),
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
