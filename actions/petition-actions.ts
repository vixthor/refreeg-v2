"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Petition,
  PetitionWithUser,
  PetitionFormData,
  PetitionFilterOptions,
} from "@/types";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth-actions";
import { isAdminOrManager } from "./role-actions";
import {
  sendPetitionApprovedEmailForUser,
  sendPetitionRejectedEmailForUser,
} from "@/services/mail";
import { sendPetitionSubmissionAdminNotification } from "@/services/mail";

export async function getPetition(
  petitionId: string
): Promise<PetitionWithUser | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("petitions")
    .select(
      `
      *,
      profiles!inner (
        full_name,
        email,
        sub_account_code,
        profile_photo
      ),
      petition_sections (
        id,
        heading,
        description
      )
    `
    )
    .eq("id", petitionId)
    .single();

  if (
    (data?.status === "pending" || data?.status === "rejected") &&
    user?.id !== data?.user_id
  ) {
    const canView = user?.id ? await isAdminOrManager(user.id) : false;
    if (!canView) {
      redirect("/");
      return null;
    }
  }
  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching petition:", error);
    throw error;
  }

  const petition = {
    ...data,
    user: {
      name: data.profiles?.full_name || "Anonymous",
      email: data.profiles?.email || "",
      sub_account_code: data.profiles?.sub_account_code || "",
    },
    sections: data.petition_sections || [],
    multimedia: data.multimedia || [],
    video_links: data.video_links || [],
  } as unknown as PetitionWithUser;

  delete (petition as any).profiles;
  delete (petition as any).petition_sections;

  return petition;
}

async function uploadImageToSupabase(
  file: File,
  userId: string,
  type: "cover" | "additional"
): Promise<string> {
  const supabase = await createClient();

  const sanitizedOriginalName = file.name.replace(/[^\w\s.-]/g, "_");
  const fileName = `${userId}-${Date.now()}-${type}-${sanitizedOriginalName}`;

  const bucket = file.type.startsWith("video/")
    ? "petition-videos"
    : "profile-photos";

  console.log("bucket", bucket);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    throw uploadError;
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
  return urlData.publicUrl;
}

export async function createPetition(
  userId: string,
  petitionData: PetitionFormData
): Promise<Petition> {
  const supabase = await createClient();

  let coverImageUrl = null;
  if (petitionData.coverImage) {
    coverImageUrl = await uploadImageToSupabase(
      petitionData.coverImage,
      userId,
      "cover"
    );
  }

  console.log("Uploaded");

  let daysActive = null;
  if (petitionData.startDate && petitionData.endDate) {
    const startDate =
      petitionData.startDate instanceof Date
        ? petitionData.startDate
        : new Date(petitionData.startDate);
    const endDate =
      petitionData.endDate instanceof Date
        ? petitionData.endDate
        : new Date(petitionData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format provided");
    }

    daysActive = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  let multimediaUrls: string[] = [];
  if (
    petitionData.multimedia &&
    Array.isArray(petitionData.multimedia) &&
    petitionData.multimedia.length > 0
  ) {
    try {
      multimediaUrls = await Promise.all(
        petitionData.multimedia.map((file) =>
          uploadImageToSupabase(file, userId, "additional")
        )
      );
    } catch (error) {
      console.error("Error uploading multimedia:", error);
      throw error;
    }
  }

  const { data: petition, error: petitionError } = await supabase
    .from("petitions")
    .insert({
      user_id: userId,
      title: petitionData.title,
      // description: petitionData.description,
      category: petitionData.category,
      goal:
        typeof petitionData.goal === "string"
          ? Number.parseFloat(petitionData.goal)
          : petitionData.goal,
      status: "pending",
      image: coverImageUrl,
      days_active: daysActive,
      multimedia: multimediaUrls,
      video_links: petitionData.video_links || [],
    })
    .select()
    .single();
  console.log(petition);
  if (petitionError) {
    console.error("Error creating petition:", petitionError);
    throw petitionError;
  }

  if (petitionData.sections && petitionData.sections.length > 0) {
    const sections = petitionData.sections.map((section) => ({
      petition_id: petition.id,
      heading: section.heading,
      description: section.description,
    }));

    const { error: sectionsError } = await supabase
      .from("petition_sections")
      .insert(sections);

    if (sectionsError) {
      console.error("Error creating sections:", sectionsError);
      throw sectionsError;
    }
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single();

    if (profile?.email) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://www.refreeg.com";
      const reviewUrl = `${baseUrl}/dashboard/admin/petitions?tab=pending`;

      await sendPetitionSubmissionAdminNotification(
        profile.full_name || "User",
        profile.email,
        petitionData.title,
        reviewUrl
      );
    }
  } catch (error) {
    console.error("Error sending petition admin notification:", error);
  }

  revalidatePath("/dashboard/petitions");
  return petition as Petition;
}

export async function updatePetition(
  petitionId: string,
  userId: string,
  petitionData: Partial<PetitionFormData>
): Promise<Petition> {
  const supabase = await createClient();

  let coverImageUrl = petitionData.coverImage
    ? await uploadImageToSupabase(petitionData.coverImage, userId, "cover")
    : petitionData.image;

  let daysActive = null;
  if (petitionData.startDate && petitionData.endDate) {
    const startDate =
      petitionData.startDate instanceof Date
        ? petitionData.startDate
        : new Date(petitionData.startDate);
    const endDate =
      petitionData.endDate instanceof Date
        ? petitionData.endDate
        : new Date(petitionData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format provided");
    }

    daysActive = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  let multimediaUrls: string[] = [];
  if (
    petitionData.multimedia &&
    Array.isArray(petitionData.multimedia) &&
    petitionData.multimedia.length > 0
  ) {
    try {
      multimediaUrls = await Promise.all(
        petitionData.multimedia.map((file) =>
          uploadImageToSupabase(file, userId, "additional")
        )
      );
    } catch (error) {
      console.error("Error uploading multimedia:", error);
      throw error;
    }
  }

  const editData: any = {
    original_petition_id: petitionId,
    user_id: userId,
    title: petitionData.title,
    description: petitionData.description || "",
    category: petitionData.category,
    goal:
      typeof petitionData.goal === "string"
        ? Number.parseFloat(petitionData.goal)
        : petitionData.goal,
    image: coverImageUrl,
    days_active: daysActive,
    multimedia: multimediaUrls.length > 0 ? multimediaUrls : [],
    video_links: petitionData.video_links || [],
    status: "pending",
  };

  const { data, error } = await supabase
    .from("petition_edits")
    .insert(editData)
    .select()
    .single();

  if (error) {
    console.error("Error saving petition edit:", error);
    throw error;
  }

  if (petitionData.sections && petitionData.sections.length > 0) {
    const sections = petitionData.sections.map((section) => ({
      petition_edit_id: data.id,
      heading: section.heading,
      description: section.description,
    }));

    const { error: sectionsError } = await supabase
      .from("petition_edit_sections")
      .insert(sections);

    if (sectionsError) {
      console.error("Error creating petition edit sections:", sectionsError);
      throw sectionsError;
    }
  }

  revalidatePath("/dashboard/petitions");
  return data;
}

export async function listPetitions(
  options: PetitionFilterOptions = {}
): Promise<Petition[]> {
  const supabase = await createClient();

  let query = supabase
    .from("petitions")
    .select("*,profiles(full_name,email,profile_photo)")
    .order("created_at", { ascending: false });

  if (options.category && options.category !== "all") {
    query = query.eq("category", options.category);
  }

  if (options.status) {
    query = query.eq("status", options.status);
  } else {
    if (!options.userId) {
      query = query.eq("status", "approved");
    }
  }

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing petitions:", error || "Unknown error");
    throw error;
  }

  const petitions = (data as Petition[]) || [];
  const nowExpired = petitions.filter(
    (p) => (p.days_active ?? 0) <= 0 && p.status === ("approved" as any)
  );

  if (nowExpired.length > 0) {
    try {
      const ids = nowExpired.map((p) => p.id);
      await supabase
        .from("petitions")
        .update({ status: "expired" })
        .in("id", ids);
    } catch (e) {
      console.error("Failed to auto-expire petitions:", e);
    }
  }

  const isOwnerScoped = !!options.userId;
  const result = isOwnerScoped
    ? petitions
    : petitions.filter((p) => p.status !== ("expired" as any));

  return result;
}

export async function countPetitions(
  options: PetitionFilterOptions = {}
): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from("petitions")
    .select("id", { count: "exact", head: true });

  if (options.category && options.category !== "all") {
    query = query.eq("category", options.category);
  }

  if (options.status) {
    query = query.eq("status", options.status);
  } else {
    if (!options.userId) {
      query = query.eq("status", "approved");
    }
  }

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Error counting petitions:", error);
    throw error;
  }

  return count || 0;
}

export async function updatePetitionStatus(
  petitionId: string,
  status: "approved" | "rejected",
  rejectionReason?: string
): Promise<Petition> {
  const supabase = await createClient();

  if (status === "approved") {
    const { data: edit, error: editError } = await supabase
      .from("petition_edits")
      .select("*")
      .eq("original_petition_id", petitionId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (editError && editError.code !== "PGRST116") {
      console.error("Error fetching petition edit for approval:", editError);
      throw editError;
    }

    let updatedPetition;

    if (edit) {
      const updateData: any = {
        title: edit.title,
        description: edit.description,
        category: edit.category,
        goal: edit.goal,
        image: edit.image,
        days_active: edit.days_active,
        multimedia: edit.multimedia || [],
        video_links: edit.video_links || [],
        status: "approved",
        updated_at: new Date().toISOString(),
      };
      const { data: updated, error: updateError } = await supabase
        .from("petitions")
        .update(updateData)
        .eq("id", petitionId)
        .select()
        .single();
      if (updateError) {
        console.error(
          "Error updating petition with approved edit:",
          updateError
        );
        throw updateError;
      }

      const { data: editSections } = await supabase
        .from("petition_edit_sections")
        .select("id, heading, description")
        .eq("petition_edit_id", edit.id);

      if (editSections && editSections.length > 0) {
        const { error: delErr } = await supabase
          .from("petition_sections")
          .delete()
          .eq("petition_id", petitionId);
        if (delErr) {
          console.error("Failed to delete old petition sections", delErr);
          throw delErr;
        }

        const { error: insErr } = await supabase
          .from("petition_sections")
          .insert(
            editSections.map((s: any) => ({
              petition_id: petitionId,
              heading: s.heading,
              description: s.description,
            }))
          );
        if (insErr) {
          console.error("Failed to insert new petition sections", insErr);
          throw insErr;
        }
      }

      await supabase
        .from("petition_edit_sections")
        .delete()
        .eq("petition_edit_id", edit.id);
      await supabase.from("petition_edits").delete().eq("id", edit.id);

      updatedPetition = updated;
    } else {
      const { data: updated, error: updateError } = await supabase
        .from("petitions")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", petitionId)
        .select()
        .single();

      if (updateError) {
        console.error("Error approving petition:", updateError);
        throw updateError;
      }
      updatedPetition = updated;
    }

    const { data: petition } = await supabase
      .from("petitions")
      .select("user_id, title, id")
      .eq("id", petitionId)
      .single();

    if (petition) {
      await sendPetitionApprovedEmailForUser(petition.user_id, {
        petitionName: petition.title,
      });
    }

    revalidatePath("/dashboard/admin/petitions");
    return updatedPetition as Petition;
  }

  if (status === "rejected") {
    const { data: edit, error: editError } = await supabase
      .from("petition_edits")
      .select("*")
      .eq("original_petition_id", petitionId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (edit && !editError) {
      await supabase
        .from("petition_edits")
        .update({ status: "rejected", rejection_reason: rejectionReason })
        .eq("id", edit.id);
    }

    const { data, error } = await supabase
      .from("petitions")
      .update({
        status: "rejected",
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", petitionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating petition status:", error);
      throw error;
    }

    const { data: petition } = await supabase
      .from("petitions")
      .select("user_id, title, id")
      .eq("id", petitionId)
      .single();

    if (petition) {
      await sendPetitionRejectedEmailForUser(petition.user_id, {
        petitionName: petition.title,
        rejectionReason: rejectionReason,
      });
    }

    revalidatePath("/dashboard/admin/petitions");
    return data as Petition;
  }

  throw new Error(`Invalid status value: ${status}`);
}

export async function getPetitionEdits(): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("petition_edits")
    .select(
      `
      *,
      profiles!inner (
        full_name,
        email,
        profile_photo
      ),
      petition_edit_sections (
        id,
        heading,
        description
      )
    `
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching petition edits:", error);
    throw error;
  }

  return data || [];
}

export async function getUserPetitions(userId: string): Promise<Petition[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("petitions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user petitions:", error);
    throw error;
  }

  return data as Petition[];
}

export async function getUserPetitionsWithStatus(
  userId: string,
  status?: string
): Promise<Petition[]> {
  const supabase = await createClient();

  let query = supabase
    .from("petitions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching user petitions with status:", error);
    throw error;
  }

  return data as Petition[];
}

export async function deletePetition(petitionId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("petitions")
    .delete()
    .eq("id", petitionId);

  if (error) {
    console.error("Error deleting petition:", error);
    throw error;
  }
}

export async function savePetitionShare(petitionId: string): Promise<void> {
  const supabase = await createClient();

  const { error: shareError, data: petitionData } = await supabase
    .from("petitions")
    .select("shared")
    .eq("id", petitionId)
    .single();
  if (shareError) {
    console.error("Error saving petition share:", shareError);
    throw shareError;
  }

  const { data: mine, error: petitionError } = await supabase
    .from("petitions")
    .update({ shared: petitionData.shared + 1 })
    .eq("id", petitionId)
    .single();

  if (petitionError) {
    console.error("Error saving petition share:", petitionError);
    throw petitionError;
  }

  return mine;
}
