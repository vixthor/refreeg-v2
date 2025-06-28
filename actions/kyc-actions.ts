"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface KycVerification {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: "pending" | "approved" | "rejected";
  verification_notes?: string;
  full_name?: string;
  dob?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export async function uploadKycDocument(
  userId: string,
  file: File,
  documentType: string,
  personalData: {
    fullName: string;
    dob: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postal: string;
    country: string;
  }
): Promise<{ documentUrl: string; error: string | null }> {
  try {
    const supabase = await createClient();

    // Check for existing KYC
    const { data: existingKyc } = await supabase
      .from("kyc_verifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingKyc && existingKyc.status === "approved") {
      return { documentUrl: "", error: "You are already verified." };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const bucket = "kyc-documents";

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return {
        documentUrl: "",
        error: "Invalid file type. Please upload a JPEG, PNG, or PDF file.",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        documentUrl: "",
        error: "File size too large. Maximum size is 5MB.",
      };
    }

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading document:", uploadError);
      return { documentUrl: "", error: uploadError.message };
    }

    // Get signed URL (valid for 1 hour)
    const { data: signedUrlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(fileName, 3600);

    if (!signedUrlData?.signedUrl) {
      return { documentUrl: "", error: "Failed to generate signed URL" };
    }

    if (existingKyc && existingKyc.status === "rejected") {
      // Update the rejected record to pending and update all fields
      const { error: updateError } = await supabase
        .from("kyc_verifications")
        .update({
          document_type: documentType,
          document_url: signedUrlData.signedUrl,
          status: "pending",
          verification_notes: "Resubmitted for review",
          full_name: personalData.fullName,
          dob: personalData.dob,
          phone: personalData.phone,
          address: personalData.address,
          city: personalData.city,
          state: personalData.state,
          postal: personalData.postal,
          country: personalData.country,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingKyc.id);

      if (updateError) {
        return { documentUrl: "", error: updateError.message };
      }
      return { documentUrl: signedUrlData.signedUrl, error: null };
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from("kyc_verifications")
        .insert({
          user_id: userId,
          document_type: documentType,
          document_url: signedUrlData.signedUrl,
          status: "pending",
          verification_notes: "Awaiting admin review",
          full_name: personalData.fullName,
          dob: personalData.dob,
          phone: personalData.phone,
          address: personalData.address,
          city: personalData.city,
          state: personalData.state,
          postal: personalData.postal,
          country: personalData.country,
        });

      if (insertError) {
        return { documentUrl: "", error: insertError.message };
      }
      return { documentUrl: signedUrlData.signedUrl, error: null };
    }
  } catch (error) {
    console.error("Error in uploadKycDocument:", error);
    return { documentUrl: "", error: "Failed to process document" };
  }
}

export async function getVerificationStatus(
  userId: string
): Promise<{ status: KycVerification | null; error: string | null }> {
  try {
    const supabase = await createClient();
    console.log("Fetching KYC for user:", userId);
    const { data, error } = await supabase
    .from("kyc_verifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle(); // ✅ Handles 0 or 1 result gracefully
  

    if (error) {
      throw error;
    }

    return { status: data, error: null };
  } catch (error) {
    console.error("Error getting verification status:", JSON.stringify(error));
    return {
      status: null,
      error: error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : JSON.stringify(error) || "Failed to get status",
    };
  }
}

// Admin function to update verification status
export async function updateVerificationStatus(
  verificationId: string,
  status: "approved" | "rejected",
  notes?: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    
    // Update KYC status
    const { error: updateError } = await supabase
      .from("kyc_verifications")
      .update({
        status: status,
        verification_notes: notes || (status === "approved" ? "Approved by admin" : "Rejected by admin"),
        updated_at: new Date().toISOString(),
      })
      .eq("id", verificationId);

    if (updateError) {
      console.error("Error updating KYC status:", updateError);
      throw updateError;
    }

    // Get the user_id from the verification record
    const { data: verification, error: fetchError } = await supabase
      .from("kyc_verifications")
      .select("user_id")
      .eq("id", verificationId)
      .single();

    if (fetchError) {
      console.error("Error fetching verification record:", fetchError);
      throw fetchError;
    }

    if (verification) {
      if (status === "approved") {
        // Update user profile to mark as verified
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ is_verified: true })
          .eq("id", verification.user_id);

        if (profileError) {
          console.error("Error updating user profile:", profileError);
          throw profileError;
        }
      } else if (status === "rejected") {
        // Remove verified status from user profile
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ is_verified: false })
          .eq("id", verification.user_id);

        if (profileError) {
          console.error("Error updating user profile:", profileError);
          throw profileError;
        }
      }
    }

    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard/settings");
    return { error: null };
  } catch (error) {
    console.error("Error in updateVerificationStatus:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
} 