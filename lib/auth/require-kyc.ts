import { createClient } from "@/lib/supabase/server";

/**
 * Server-side helper to verify that a user has approved KYC and a complete
 * profile. Returns a redirect path string if the user fails a check, or
 * `null` if all requirements are met.
 *
 * Used by create-route layouts (causes, petitions) to gate access.
 */
export async function requireKycAndProfile(
  userId: string
): Promise<string | null> {
  const supabase = await createClient();

  // 1. Check KYC status
  const { data: kycVerification } = await supabase
    .from("kyc_verifications")
    .select("status")
    .eq("user_id", userId)
    .single();

  if (!kycVerification) {
    return "/dashboard/settings/kyc?error=kyc_required";
  }

  if (kycVerification.status !== "approved") {
    return `/dashboard/settings/kyc?error=kyc_${kycVerification.status}`;
  }

  // 2. Check profile completeness (full_name + profile_photo)
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, profile_photo")
    .eq("id", userId)
    .single();

  const hasFullName = !!(profile?.full_name && profile.full_name.trim() !== "");
  const hasPhoto = !!profile?.profile_photo;

  if (!hasFullName || !hasPhoto) {
    return "/dashboard/settings/profile?error=profile_incomplete";
  }

  return null;
}
