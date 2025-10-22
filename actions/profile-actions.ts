"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Profile,
  ProfileFormData,
  BankDetailsFormData,
  OnboardingProfileData,
} from "@/types";

/**
 * Get a user's profile
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching profile:", error);
    throw error;
  }

  return data as Profile;
}

/**
 * Check if a user has bank details
 */
export async function hasBankDetails(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return !!(profile && profile.account_number && profile.bank_name);
}

/**
 * Update a user's profile
 */
export async function updateProfile(
  userId: string,
  profileData: ProfileFormData
): Promise<Profile> {
  const supabase = await createClient();

  const updateData = {
    id: userId,
    full_name: profileData.name,
    email: profileData.email,
    phone: profileData.phone,
    bio: profileData.bio,
    profile_photo: profileData.profile_photo,
    twitter_url: profileData.twitter_url || null,
    facebook_url: profileData.facebook_url || null,
    instagram_url: profileData.instagram_url || null,
    linkedin_url: profileData.linkedin_url || null,
    updated_at: new Date().toISOString(),
  };

  console.log("Updating profile with data:", updateData);

  const { data, error } = await supabase
    .from("profiles")
    .upsert(updateData)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

  revalidatePath("/dashboard/settings");
  revalidatePath(`/profile/${userId}`);
  revalidatePath("/");

  return data as Profile;
}

/**
 * Update a user's profile photo
 */
export async function updateProfilePhoto(
  userId: string,
  photoFile: File
): Promise<string> {
  const supabase = await createClient();

  const fileName = `${userId}-${Date.now()}-${photoFile.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(fileName, photoFile, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading profile photo:", uploadError);
    throw uploadError;
  }

  const { data: urlData } = supabase.storage
    .from("profile-photos")
    .getPublicUrl(fileName);

  const publicUrl = urlData.publicUrl;

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      profile_photo: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating profile with photo URL:", error);
    throw error;
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/");
  return publicUrl;
}

/**
 * Update a user's bank details
 */
export async function updateBankDetails(
  userId: string,
  bankData: BankDetailsFormData
): Promise<Profile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      account_number: bankData.accountNumber,
      bank_name: bankData.bankName,
      account_name: bankData.accountName,
      sub_account_code: bankData.sub_account_code,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating bank details:", error);
    throw error;
  }

  revalidatePath("/dashboard/settings");
  return data as Profile;
}

/**
 * Create a new profile during onboarding
 */
export async function createOnboardingProfile(
  userId: string,
  profileData: OnboardingProfileData,
  oauthAvatarUrl?: string | null
): Promise<Profile> {
  const supabase = await createClient();

  // Upload profile photo if provided, otherwise use OAuth avatar
  let profilePhotoUrl: string | null = null;
  if (profileData.profilePhoto) {
    const fileName = `${userId}-${Date.now()}-${profileData.profilePhoto.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(fileName, profileData.profilePhoto, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading profile photo:", uploadError);
      throw new Error("Failed to upload profile photo");
    }

    const { data: urlData } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(fileName);
    profilePhotoUrl = urlData.publicUrl;
  } else if (oauthAvatarUrl) {
    // Use OAuth avatar URL if no custom photo uploaded
    profilePhotoUrl = oauthAvatarUrl;
  }

  const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();

  // Start with basic required fields
  const insertData: any = {
    id: userId,
    email: profileData.email,
    full_name: fullName,
    phone: profileData.phone,
    profile_photo: profilePhotoUrl,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Try to add new fields, but don't fail if they don't exist
  try {
    if (profileData.firstName) insertData.first_name = profileData.firstName;
    if (profileData.lastName) insertData.last_name = profileData.lastName;
    if (profileData.username) insertData.username = profileData.username;
    if (profileData.location) insertData.location = profileData.location;
    if (profileData.accountType)
      insertData.account_type = profileData.accountType;
    if (profileData.gender) insertData.gender = profileData.gender;
  } catch (e) {
    console.warn("Some fields may not exist in database schema:", e);
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Error creating profile:", error);
    throw new Error(`Failed to create profile: ${error.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/");
  return data as Profile;
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "full_name, phone, email, first_name, last_name, username, location"
      )
      .eq("id", userId)
      .single();

    if (error) {
      return false;
    }

    // Check if all required fields from step 3 are present
    return !!(
      profile?.full_name &&
      profile?.phone &&
      profile?.email &&
      profile?.first_name &&
      profile?.last_name &&
      profile?.username &&
      profile?.location
    );
  } catch (error) {
    console.error("Error checking onboarding completion:", error);
    return false;
  }
}

/**
 * Determine the current onboarding step based on existing profile data
 * Returns the step number (1-5) where the user should resume
 */
export async function getCurrentOnboardingStep(
  userId: string
): Promise<number> {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "account_type, gender, first_name, last_name, username, location, phone, email, profile_photo"
      )
      .eq("id", userId)
      .single();

    if (error || !profile) {
      return 1; // Start from step 1 if no profile exists
    }

    // Step 1: Check if account_type is set
    if (!profile.account_type) {
      return 1;
    }

    // Step 2: Check if gender is set
    if (!profile.gender) {
      return 2;
    }

    // Step 3: Check if all profile fields are set
    const hasProfileData = !!(
      profile.first_name &&
      profile.last_name &&
      profile.username &&
      profile.location &&
      profile.phone &&
      profile.email
    );

    if (!hasProfileData) {
      return 3;
    }

    // If all steps 1-3 are complete, user can proceed to step 4 (KYC)
    return 4;
  } catch (error) {
    console.error("Error determining onboarding step:", error);
    return 1;
  }
}

/**
 * Fetch existing onboarding data from database for prefilling forms
 */
export async function getOnboardingData(userId: string): Promise<{
  accountType: string;
  gender: string;
  profile: {
    firstName: string;
    lastName: string;
    username: string;
    location: string;
    phone: string;
    email: string;
    profilePhoto?: string;
  };
}> {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "account_type, gender, first_name, last_name, username, location, phone, email, profile_photo"
      )
      .eq("id", userId)
      .single();

    if (error || !profile) {
      // Return empty data if no profile exists
      return {
        accountType: "",
        gender: "",
        profile: {
          firstName: "",
          lastName: "",
          username: "",
          location: "",
          phone: "",
          email: "",
        },
      };
    }

    return {
      accountType: profile.account_type || "",
      gender: profile.gender || "",
      profile: {
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        username: profile.username || "",
        location: profile.location || "",
        phone: profile.phone || "",
        email: profile.email || "",
        profilePhoto: profile.profile_photo || undefined,
      },
    };
  } catch (error) {
    console.error("Error fetching onboarding data:", error);
    return {
      accountType: "",
      gender: "",
      profile: {
        firstName: "",
        lastName: "",
        username: "",
        location: "",
        phone: "",
        email: "",
      },
    };
  }
}

/**
 * Save step 1 progress (account type)
 */
export async function saveStep1Progress(
  userId: string,
  accountType: string
): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      account_type: accountType,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error saving step 1 progress:", error);
      throw error;
    }

    revalidatePath("/onboarding");
  } catch (error) {
    console.error("Error in saveStep1Progress:", error);
    throw error;
  }
}

/**
 * Save step 2 progress (gender)
 */
export async function saveStep2Progress(
  userId: string,
  gender: string
): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      gender: gender,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error saving step 2 progress:", error);
      throw error;
    }

    revalidatePath("/onboarding");
  } catch (error) {
    console.error("Error in saveStep2Progress:", error);
    throw error;
  }
}

/**
 * Check if profile is complete
 */
export async function isProfileComplete(
  userId: string
): Promise<{ isComplete: boolean; missingFields: string[] }> {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name, bio, profile_photo")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile for completion check:", error);
      return { isComplete: false, missingFields: ["profile"] };
    }

    const missingFields: string[] = [];

    if (!profile?.full_name || profile.full_name.trim() === "") {
      missingFields.push("full name");
    }

    if (!profile?.bio || profile.bio.trim() === "") {
      missingFields.push("bio");
    }

    if (!profile?.profile_photo) {
      missingFields.push("profile picture");
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields,
    };
  } catch (error) {
    console.error("Error in isProfileComplete:", error);
    return { isComplete: false, missingFields: ["profile"] };
  }
}

/* ------------------------------------------------------------------
   KYC ACTIONS
------------------------------------------------------------------ */

/**
 * Check if a user has a KYC verification
 */
export async function hasKycVerification(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kyc_verifications")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;

  // Map storage path in document_url to public URL for consumers
  if (data.document_url) {
    const { data: urlData } = supabase.storage
      .from("kyc-documents")
      .getPublicUrl(data.document_url);
    if (urlData?.publicUrl) {
      (data as any).document_url = urlData.publicUrl;
    }
  }

  return data;
}

/**
 * Update a KYC verification status
 */
export async function updateKycStatus(
  verificationId: string,
  status: "approved" | "rejected",
  notes?: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kyc_verifications")
    .update({
      status,
      verification_notes: notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", verificationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
