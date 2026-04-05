import { notFound } from "next/navigation";
import { getCause } from "@/actions/cause-actions";
import { getCachedUser } from "@/lib/supabase/cached-user";
import { getProfile } from "@/actions/profile-actions";
import { listDonationsForCause } from "@/actions/donation-actions";
import { listCommentsForCause } from "@/actions/comment-actions";
import CampaignQualityLab from "@/app/campaign/_components/campaign-quality-lab";

import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cause = await getCause(id);

  if (!cause) {
    return {
      title: "Cause Not Found",
    };
  }

  return {
    title: cause.title,
    description: cause.description?.substring(0, 160),
    openGraph: {
      title: cause.title,
      description: cause.description?.substring(0, 160),
      images: cause.image ? [{ url: cause.image }] : [],
    },
  };
}

export default async function CauseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch initial independent data in parallel
  const [cause, donors, comments, { user }] = await Promise.all([
    getCause(id),
    listDonationsForCause(id),
    listCommentsForCause(id),
    getCachedUser()
  ]);

  if (!cause) {
    notFound();
  }

  // Fetch profiles in parallel based on cause and user availability
  const [myprofile, creatorProfile] = await Promise.all([
    user ? getProfile(user.id) : Promise.resolve(undefined),
    getProfile(cause.user_id)
  ]);

  const profile = {
    email: myprofile?.email || "",
    name: myprofile?.full_name || "",
    id: myprofile?.id || "",
    subaccount: myprofile?.sub_account_code || "",
  };

  return (
    <CampaignQualityLab
      cause={cause}
      donors={donors}
      comments={comments}
      profile={profile}
      creatorHasWallet={!!creatorProfile?.solana_wallet}
      currentUserId={user?.id}
    />
  );
}
