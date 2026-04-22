import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { hasBankDetails } from "@/actions/profile-actions";
import CreateCauseForm from "./create-cause-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CreateCausePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const hasBankInfo = await hasBankDetails(session.user.id as string);

  return (
    <div className="">
      <div className="">
        {!hasBankInfo ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Bank Details Required</AlertTitle>
            <AlertDescription className="flex flex-col gap-4">
              Please add your bank details in the settings to create a cause.
              This is required to receive donations.
              <Link href="/dashboard/settings/bank">
                <Button variant="destructive" className="w-fit">
                  Add Bank Details
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        ) : (
          <CreateCauseForm />
        )}
      </div>
    </div>
  );
}
