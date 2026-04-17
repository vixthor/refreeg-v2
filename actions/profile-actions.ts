"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type {
  Profile,
  ProfileFormData,
  BankDetailsFormData,
  OnboardingProfileData,
} from "@/types";

// Helper function to map Prisma Profile to the expected Profile type
function mapPrismaToProfile(p: any): Profile {
  return {
    id: p.id,
    email: p.email,
    full_name: p.fullName,
    first_name: p.firstName,
    last_name: p.lastName,
    username: p.username,
    phone: p.phone,
    location: p.location,
    account_number: p.accountNumber,
    bank_name: p.bankName,
    account_name: p.accountName,
    sub_account_code: p.subAccountCode,
    profile_photo: p.profilePhoto,
    is_blocked: p.isBlocked ?? false,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt?.toISOString() || new Date().toISOString(),
    account_type: p.accountType as any,
    is_verified: p.isVerified ?? false,
    gender: p.gender,
    bio: p.bio,
    solana_wallet: p.solana_wallet,
    twitter_url: p.twitter_url,
    facebook_url: p.facebook_url,
    instagram_url: p.instagram_url,
    linkedin_url: p.linkedin_url,
  } as Profile;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!profile) return null;

    return mapPrismaToProfile(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}

export async function hasBankDetails(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return !!(profile && profile.account_number && profile.bank_name);
}

export async function updateProfile(
  userId: string,
  profileData: ProfileFormData,
): Promise<Profile> {
  try {
    const data = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: profileData.name,
        email: profileData.email,
        username: profileData.username,
        phone: profileData.phone,
        bio: profileData.bio,
        accountType: profileData.account_type,
        profilePhoto: profileData.profile_photo,
        twitter_url: profileData.twitter_url || null,
        facebook_url: profileData.facebook_url || null,
        instagram_url: profileData.instagram_url || null,
        linkedin_url: profileData.linkedin_url || null,
      }
    });

    revalidatePath("/dashboard/settings");
    revalidatePath(`/profile/${userId}`);
    revalidatePath("/");

    return mapPrismaToProfile(data);
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
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
  try {
    const data = await prisma.user.update({
      where: { id: userId },
      data: {
        accountNumber: bankData.accountNumber,
        bankName: bankData.bankName,
        accountName: bankData.accountName,
        subAccountCode: bankData.sub_account_code,
      }
    });

    revalidatePath("/dashboard/settings");
    return mapPrismaToProfile(data);
  } catch (error) {
    console.error("Error updating bank details:", error);
    throw error;
  }
}

export async function createOnboardingProfile(
  userId: string,
  profileData: OnboardingProfileData,
  oauthAvatarUrl?: string | null,
): Promise<any> {
  const supabase = await createClient(); // Keep for storage only

  const existingProfile = await prisma.user.findUnique({
    where: { id: userId },
    select: { profilePhoto: true }
  });

  let profilePhotoUrl: string | null = existingProfile?.profilePhoto ?? null;

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
    onboarding_completed: true,
  };

  if (profileData.email) updateData.email = profileData.email;
  if (profileData.phone) updateData.phone = profileData.phone;
  if (fullName) updateData.fullName = fullName;
  if (profilePhotoUrl) updateData.profilePhoto = profilePhotoUrl;

  if (profileData.firstName) updateData.firstName = profileData.firstName;
  if (profileData.lastName) updateData.lastName = profileData.lastName;
  if (profileData.username) updateData.username = profileData.username;
  if (profileData.location) updateData.location = profileData.location;
  if (profileData.accountType) updateData.accountType = profileData.accountType;
  if (profileData.gender) updateData.gender = profileData.gender;

  try {
    const data = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    revalidatePath("/dashboard");
    revalidatePath("/");
    return data;
  } catch (error: any) {
    console.error("Error creating/updating profile:", error);
    throw new Error(`Failed to create profile: ${error.message}`);
  }
}

export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        fullName: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        location: true,
        createdAt: true,
      }
    });

    if (!profile) {
      return false;
    }

    const hasBasicProfile = !!(profile.fullName && profile.email);

    const hasOnboardingFields = !!(
      profile.firstName &&
      profile.lastName &&
      profile.username &&
      profile.location &&
      profile.phone
    );

    if (hasBasicProfile && !hasOnboardingFields) {
      // Check if the user is very old (created before onboarding fields were added)
      // For new users created by the trigger, this should be false
      const createdAt = new Date(profile.createdAt);
      const onboardingcutoff = new Date("2024-12-21"); // Date when onboarding was added

      if (createdAt < onboardingcutoff) {
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
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        accountType: true,
        gender: true,
        firstName: true,
        lastName: true,
        username: true,
        location: true,
        phone: true,
        email: true,
        profilePhoto: true,
      }
    });

    if (!profile) {
      return 1;
    }

    if (!profile.accountType) {
      return 1;
    }

    if (!profile.gender) {
      return 2;
    }

    const hasProfileData = !!(
      profile.firstName &&
      profile.lastName &&
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
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        accountType: true,
        gender: true,
        firstName: true,
        lastName: true,
        username: true,
        location: true,
        phone: true,
        email: true,
        profilePhoto: true,
      }
    });

    if (!profile) {
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
      accountType: profile.accountType || "",
      gender: profile.gender || "",
      profile: {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        username: profile.username || "",
        location: profile.location || "",
        phone: profile.phone || "",
        email: profile.email || "",
        profilePhoto: profile.profilePhoto || undefined,
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
    await prisma.user.update({
      where: { id: userId },
      data: {
        accountType: accountType
      }
    });

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
    await prisma.user.update({
      where: { id: userId },
      data: {
        gender: gender
      }
    });

    revalidatePath("/onboarding");
  } catch (error) {
    console.error("Error in saveStep2Progress:", error);
    throw error;
  }
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    const profile = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });
    return !profile; // Return true if profile does not exist (username is available)
  } catch (error) {
    console.error("Error checking username availability:", error);
    return false; // Safely return false if an error occurs
  }
}

export async function isProfileComplete(
  userId: string,
): Promise<{ isComplete: boolean; missingFields: string[] }> {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, profilePhoto: true }
    });

    if (!profile) {
      return { isComplete: false, missingFields: ["profile"] };
    }

    const missingFields: string[] = [];

    if (!profile.fullName || profile.fullName.trim() === "") {
      missingFields.push("full name");
    }

    if (!profile.profilePhoto) {
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
  try {
    const profile = await prisma.user.findUnique({
      where: { username }
    });

    if (!profile) return null;

    return mapPrismaToProfile(profile);
  } catch (error) {
    console.error("Error in getProfileByUsername:", error);
    return null;
  }
}
