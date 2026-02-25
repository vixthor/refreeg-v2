import { notFound } from "next/navigation";
import { getCause, getCurrentUser, getProfile } from "@/actions";
import PledgeScreen from "@/app/campaign-quality-test/_components/pledge-screen";

export default async function CampaignQualityPledgePage({
  searchParams,
}: {
  searchParams?: { id?: string };
}) {
  const causeId = searchParams?.id;

  if (!causeId) {
    return (
      <PledgeScreen
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
        }}
        profile={{ email: "", name: "", id: "", subaccount: "" }}
      />
    );
  }

  const cause = await getCause(causeId);
  if (!cause) {
    notFound();
  }

  const user = await getCurrentUser();
  const myprofile = user ? await getProfile(user.id) : undefined;

  const profile = {
    email: myprofile?.email || "",
    name: myprofile?.full_name || "",
    id: myprofile?.id || "",
    subaccount: myprofile?.sub_account_code || "",
  };

  return <PledgeScreen cause={cause} profile={profile} />;
}
