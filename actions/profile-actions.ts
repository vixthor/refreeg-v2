"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Profile,
  ProfileFormData,
  BankDetailsFormData,
  OnboardingProfileData,
} from "@/types";

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

export async function hasBankDetails(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return !!(profile && profile.account_number && profile.bank_name);
}

export async function updateProfile(
  userId: string,
  profileData: ProfileFormData,
): Promise<Profile> {
  const supabase = await createClient();

  const updateData = {
    id: userId,
    full_name: profileData.name,
    email: profileData.email,
    username: profileData.username,
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

export async function updateProfilePhoto(
  userId: string,
  photoFile: File,
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

export async function updateBankDetails(
  userId: string,
  bankData: BankDetailsFormData,
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

export async function createOnboardingProfile(
  userId: string,
  profileData: OnboardingProfileData,
  oauthAvatarUrl?: string | null,
): Promise<Profile> {
  const supabase = await createClient();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("profile_photo")
    .eq("id", userId)
    .maybeSingle();

  let profilePhotoUrl: string | null = existingProfile?.profile_photo ?? null;

  if (profileData.profilePhoto) {
    const fileName = `${userId}-${Date.now()}-${profileData.profilePhoto.name}`;

    const { error: uploadError } = await supabase.storage
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
  } else if (!profilePhotoUrl && oauthAvatarUrl) {
    profilePhotoUrl = oauthAvatarUrl;
  }

  const fullName = `${profileData.firstName ?? ""} ${
    profileData.lastName ?? ""
  }`.trim();

  const updateData: any = {
    id: userId,
    updated_at: new Date().toISOString(),
    onboarding_completed: true,
  };

  if (profileData.email) updateData.email = profileData.email;
  if (profileData.phone) updateData.phone = profileData.phone;
  if (fullName) updateData.full_name = fullName;
  if (profilePhotoUrl) updateData.profile_photo = profilePhotoUrl;

  try {
    if (profileData.firstName) updateData.first_name = profileData.firstName;
    if (profileData.lastName) updateData.last_name = profileData.lastName;
    if (profileData.username) updateData.username = profileData.username;
    if (profileData.location) updateData.location = profileData.location;
    if (profileData.accountType)
      updateData.account_type = profileData.accountType;
    if (profileData.gender) updateData.gender = profileData.gender;
  } catch (e) {
    console.warn("Some fields may not exist in database schema:", e);
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(updateData, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("Error creating/updating profile:", error);
    throw new Error(`Failed to create profile: ${error.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/");
  return data as Profile;
}

export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "full_name, phone, email, first_name, last_name, username, location, created_at",
      )
      .eq("id", userId)
      .single();

    if (error || !profile) {
      return false;
    }

    const hasBasicProfile = !!(profile.full_name && profile.email);

    const hasOnboardingFields = !!(
      profile.first_name &&
      profile.last_name &&
      profile.username &&
      profile.location &&
      profile.phone
    );

    if (hasBasicProfile && !hasOnboardingFields) {
      // Check if the user is very old (created before onboarding fields were added)
      // For new users created by the trigger, this should be false
      const createdAt = new Date(profile.created_at);
      const onboardingcutoff = new Date("2024-12-21"); // Date when onboarding was added

      if (createdAt < onboardingcutoff) {
        console.log(
          `Grandfathered existing user ${userId} - has basic profile but no onboarding fields`,
        );
        return true;
      }
    }

    return hasOnboardingFields;
  } catch (error) {
    console.error("Error checking onboarding completion:", error);
    return false;
  }
}

export async function getCurrentOnboardingStep(
  userId: string,
): Promise<number> {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "account_type, gender, first_name, last_name, username, location, phone, email, profile_photo",
      )
      .eq("id", userId)
      .single();

    if (error || !profile) {
      return 1;
    }

    if (!profile.account_type) {
      return 1;
    }

    if (!profile.gender) {
      return 2;
    }

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

    return 4;
  } catch (error) {
    console.error("Error determining onboarding step:", error);
    return 1;
  }
}

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
        "account_type, gender, first_name, last_name, username, location, phone, email, profile_photo",
      )
      .eq("id", userId)
      .single();

    if (error || !profile) {
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

export async function saveStep1Progress(
  userId: string,
  accountType: string,
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

export async function saveStep2Progress(
  userId: string,
  gender: string,
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

export async function isProfileComplete(
  userId: string,
): Promise<{ isComplete: boolean; missingFields: string[] }> {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name, profile_photo")
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

export async function hasKycVerification(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kyc_verifications")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;

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

export async function updateKycStatus(
  verificationId: string,
  status: "approved" | "rejected",
  notes?: string,
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

export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  const supabase = await createClient();
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      console.error("Error fetching profile by username:", error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Error in getProfileByUsername:", error);
    return null;
  }
}
