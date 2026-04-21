import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPetition } from "@/actions/petition-actions";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const EditPetitionForm = dynamic(() => import("./edit-petition-form"), {
  loading: () => <Skeleton className="h-[600px] w-full" />,
});

import { getCachedUser } from "@/lib/supabase/cached-user";

export default async function EditPetitionPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const myParams = await params;
  
  const [ { user, error: authError }, petition ] = await Promise.all([
    getCachedUser(),
    getPetition(myParams.id)
  ]);

  if (!user || authError) {
    redirect("/auth/signin");
  }

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
