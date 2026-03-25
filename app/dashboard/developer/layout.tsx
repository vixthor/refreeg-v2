import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getProfile } from "@/actions/profile-actions";
import { getCurrentUser } from "@/actions/auth-actions";
import DeveloperNav from "./DeveloperNav";

export default async function DeveloperLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");

  const profile = await getProfile(user.id);
  
  if (profile?.account_type !== "developer") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-8 px-4 sm:px-6 border border-slate-100 rounded-xl my-4">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Developer Area</h1>
        <p className="text-muted-foreground mt-2">
          Manage your API keys, webhooks, and technical integrations for the RefreeG Crowdfunding service.
        </p>
        
        <DeveloperNav />
      </div>
      <div className="min-h-[500px]">
        {children}
      </div>
    </div>
  );
}
