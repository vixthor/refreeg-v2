import { notFound } from "next/navigation";
import { getCause, getCurrentUser, getProfile } from "@/actions";
import PledgeScreen from "@/app/campaign/_components/pledge-screen";

export default async function CausePledgePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cause = await getCause(id);
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
