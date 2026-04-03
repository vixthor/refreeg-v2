import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPetition } from "@/actions/petition-actions";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const EditPetitionForm = dynamic(() => import("./edit-petition-form"), {
  loading: () => <Skeleton className="h-[600px] w-full" />,
});

export default async function EditPetitionPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }
  const myParams = await params;
  const petition = await getPetition(myParams.id);

  if (!petition) {
    redirect("/dashboard/petitions");
  }

  if (petition.user_id !== user.id) {
    redirect("/dashboard/petitions");
  }

  return (
    <div className="">
      <div className="md:mx-auto">
        <EditPetitionForm petition={petition} />
      </div>
    </div>
  );
}
