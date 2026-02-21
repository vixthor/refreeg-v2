import { notFound } from "next/navigation";
import {
  getCause,
  getCurrentUser,
  getProfile,
  listDonationsForCause,
} from "@/actions";
import { listCommentsForCause } from "@/actions/comment-actions";
import CampaignQualityLab from "@/app/campaign-quality-test/_components/campaign-quality-lab";

export default async function CampaignQualityTestPage({
  searchParams,
}: {
  searchParams?: { id?: string };
}) {
  const causeId = searchParams?.id;

  if (!causeId) {
    return (
      <CampaignQualityLab
        isDemo
        cause={{
          id: "demo-cause",
          user_id: "demo-user",
          title: "Rebuild Safe Homes After Flooding",
          description:
            "A fast, evidence-backed response to restore housing for displaced families.",
          summary:
            "Verified, milestone-based relief with evidence-locked releases and transparent updates.",
          category: "disaster relief",
          goal: 7500000,
          raised: 4980000,
          status: "approved",
          rejection_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          image: "/test_assets/test1.jpg",
          days_active: 133,
          multimedia: ["/test_assets/test1.jpg", "/test_assets/test2.jpg"],
          video_links: [],
          location: "Lagos, Nigeria",
          user: {
            name: "RefreeG Relief Team",
            email: "hello@refreeg.com",
            sub_account_code: "",
          },
          sections: [
            {
              heading: "Why this matters",
              description:
                "Flooding displaced over 120 families. We are funding emergency shelter, clean water, and hygiene kits, with milestone escrow protecting donor funds.",
            },
            {
              heading: "How funds are released",
              description:
                "Each milestone requires evidence uploads (receipts, photos, beneficiary confirmations). Funds are released only after review.",
            },
          ],
        }}
        donors={[
          { id: "demo-1", name: "Ifeoma", amount: 120000 },
          { id: "demo-2", name: "Santiago", amount: 75000 },
          { id: "demo-3", name: "Anonymous", amount: 300000 },
        ]}
        commentsCount={12}
        profile={{ email: "", name: "", id: "", subaccount: "" }}
        creatorHasWallet={false}
      />
    );
  }

  const cause = await getCause(causeId);
  if (!cause) {
    notFound();
  }

  const donors = await listDonationsForCause(cause.id);
  const comments = await listCommentsForCause(cause.id);
  const user = await getCurrentUser();
  const myprofile = user ? await getProfile(user.id) : undefined;
  const creatorProfile = await getProfile(cause.user_id);

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
      commentsCount={comments.length}
      profile={profile}
      creatorHasWallet={!!creatorProfile?.solana_wallet}
    />
  );
}
