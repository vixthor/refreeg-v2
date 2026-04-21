import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { hasBankDetails } from "@/actions/profile-actions";
import { getCause } from "@/actions/cause-actions";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const EditCauseForm = dynamic(() => import("./edit-cause-form"), {
  loading: () => <Skeleton className="h-[600px] w-full" />,
});

import { getCachedUser } from "@/lib/supabase/cached-user";

export default async function EditCausePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const myParams = await params;
  
  const supabase = await createClient();
  
  const [{ user, error: authError }, cause] = await Promise.all([
    getCachedUser(),
    getCause(myParams.id)
  ]);

  if (!user || authError) {
    redirect("/auth/signin");
  }

  // Dependent fetch
  const [hasBankInfo, { data: pendingEdit }] = await Promise.all([
    hasBankDetails(user.id),
    supabase
      .from("cause_edits")
      .select("status")
      .eq("original_cause_id", myParams.id)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle()
  ]);

  if (pendingEdit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <h1 className="text-2xl font-bold">Edit Already Pending</h1>
        <p className="text-muted-foreground max-w-md">
          You already have an edit request for this cause pending review. 
          Please wait for our team to approve or reject your previous changes before making more edits.
        </p>
        <a
          href="/dashboard/causes"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Back to Causes
        </a>
      </div>
    );
  }

  if (!cause) {
    redirect("/dashboard/causes");
  }

  if (cause.user_id !== user.id) {
    redirect("/dashboard/causes");
  }

  return (
    <div className="">
      <div className="md:mx-auto">
        {!hasBankInfo ? (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Bank Details Required</h1>
            <p className="text-muted-foreground">
              Please add your bank details in the settings to edit your cause.
              This is required to receive donations.
            </p>
            <a
              href="/dashboard/settings/bank"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Add Bank Details
            </a>
          </div>
        ) : (
          <EditCauseForm cause={cause} />
        )}
      </div>
    </div>
  );
}
