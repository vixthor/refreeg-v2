"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type {
  Cause,
  CauseWithUser,
  CauseFormData,
  CauseFilterOptions,
} from "@/types";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth-actions";
import { isAdminOrManager } from "./role-actions";
import { sendCauseSubmissionAdminNotification } from "@/services/mail";
import { cache } from "react";

/**
 * Get a cause by ID
 */
export async function getCause(causeId: string): Promise<CauseWithUser | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("causes")
    .select(
      `
      *,
      profiles!inner (
        full_name,
        email,
        sub_account_code,
        profile_photo
      ),
      cause_sections (
        id,
        heading,
        description
      )
    `,
    )
    .eq("id", causeId)
    .order("id", { foreignTable: "cause_sections", ascending: true })
    .single();

  const isAdmin = user?.id ? await isAdminOrManager(user.id) : false;

  if (
    (data?.status === "pending" || data?.status === "rejected") &&
    user?.id !== data?.user_id &&
    !isAdmin
  ) {
    redirect("/");
    return null;
  }
  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching cause:", error);
    throw error;
  }

  // Check if current user is following this cause
  let isFollowing = false;
  if (user?.id) {
    const { data: followData } = await supabase
      .from("campaign_follows")
      .select("id")
      .eq("cause_id", causeId)
      .eq("user_id", user.id)
      .maybeSingle();
    isFollowing = !!followData;
  }

  const cause = {
    ...data,
    user: {
      name: data.profiles?.full_name || "Anonymous",
      email: data.profiles?.email || "",
      sub_account_code: data.profiles?.sub_account_code || "",
      profile_photo: data.profiles?.profile_photo || null,
    },
    sections: data.cause_sections || [],
    multimedia: data.multimedia || [],
    video_links: data.video_links || [],
    trust_score: data.trust_score || {
      impact: "B+",
      readability: "A",
      transparency: "High",
    },
    verified_status: data.verified_status || "pending",
    summary: data.summary || null,
    location: data.location || null,
    faqs: data.faqs || [],
    isFollowing,
  } as unknown as CauseWithUser;

  delete (cause as any).profiles;
  delete (cause as any).cause_sections;

  return cause;
}

/**
 * Upload an image to Supabase storage
 */
async function uploadImageToSupabase(
  file: File,
  userId: string,
  type: "cover" | "additional",
): Promise<string> {
  const supabase = await createClient();

  const sanitizedOriginalName = file.name.replace(/[^\w\s.-]/g, "_");
  const fileName = `${userId}-${Date.now()}-${type}-${sanitizedOriginalName}`;

  const bucket = file.type.startsWith("video/")
    ? "cause-videos"
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

/**
 * Create a new cause
 */
export async function createCause(
  userId: string,
  causeData: CauseFormData,
): Promise<Cause> {
  const supabase = await createClient();

  let coverImageUrl = null;
  if (causeData.coverImage) {
    coverImageUrl = await uploadImageToSupabase(
      causeData.coverImage,
      userId,
      "cover",
    );
  }

  console.log("Uploaded");

  let daysActive = null;
  if (causeData.startDate && causeData.endDate) {
    const startDate =
      causeData.startDate instanceof Date
        ? causeData.startDate
        : new Date(causeData.startDate);
    const endDate =
      causeData.endDate instanceof Date
        ? causeData.endDate
        : new Date(causeData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format provided");
    }

    daysActive = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  let multimediaUrls: string[] = [];
  if (
    causeData.multimedia &&
    Array.isArray(causeData.multimedia) &&
    causeData.multimedia.length > 0
  ) {
    try {
      multimediaUrls = await Promise.all(
        causeData.multimedia.map((file) =>
          uploadImageToSupabase(file, userId, "additional"),
        ),
      );
    } catch (error) {
      console.error("Error uploading multimedia:", error);
      throw error;
    }
  }

  const { data: cause, error: causeError } = await supabase
    .from("causes")
    .insert({
      user_id: userId,
      title: causeData.title,
      category: causeData.category,
      goal:
        typeof causeData.goal === "string"
          ? Number.parseFloat(causeData.goal)
          : causeData.goal,
      status: "pending",
      image: coverImageUrl,
      days_active: daysActive,
      multimedia: multimediaUrls,
      video_links: causeData.video_links || [],
      summary: causeData.summary || null,
      location: causeData.location || null,
    })
    .select()
    .single();
  console.log(cause);
  if (causeError) {
    console.error("Error creating cause:", causeError);
    throw causeError;
  }

  if (causeData.sections && causeData.sections.length > 0) {
    const sections = causeData.sections.map((section) => ({
      cause_id: cause.id,
      heading: section.heading,
      description: section.description,
    }));

    const { error: sectionsError } = await supabase
      .from("cause_sections")
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
      const reviewUrl = `${baseUrl}/dashboard/admin/causes?tab=pending`;

      // Send notification in background - do not await
      sendCauseSubmissionAdminNotification(
        profile.full_name || "User",
        profile.email,
        causeData.title,
        reviewUrl,
      ).catch((err) => console.error("Background notification error:", err));
    }
  } catch (error) {
    console.error("Error sending cause admin notification:", error);
  }

  revalidatePath("/dashboard/causes");
  return cause as Cause;
}

/**
 * Submit a cause edit request (goes into cause_edits table)
 */
export async function updateCause(
  causeId: string,
  userId: string,
  causeData: Partial<CauseFormData>,
): Promise<any> {
  const supabase = await createClient();

  let coverImageUrl = causeData.coverImage
    ? await uploadImageToSupabase(causeData.coverImage, userId, "cover")
    : causeData.image || null;

  let daysActive = null;
  if (causeData.startDate && causeData.endDate) {
    const startDate =
      causeData.startDate instanceof Date
        ? causeData.startDate
        : new Date(causeData.startDate);
    const endDate =
      causeData.endDate instanceof Date
        ? causeData.endDate
        : new Date(causeData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format provided");
    }

    daysActive = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  let multimediaUrls: string[] = [];
  if (
    causeData.multimedia &&
    Array.isArray(causeData.multimedia) &&
    causeData.multimedia.length > 0
  ) {
    try {
      multimediaUrls = await Promise.all(
        causeData.multimedia.map((file) =>
          uploadImageToSupabase(file, userId, "additional"),
        ),
      );
    } catch (error) {
      console.error("Error uploading multimedia:", error);
      throw error;
    }
  }

  const editData: any = {
    original_cause_id: causeId,
    user_id: userId,
    title: causeData.title,
    category: causeData.category,
    goal:
      typeof causeData.goal === "string"
        ? Number.parseFloat(causeData.goal)
        : causeData.goal,
    image: coverImageUrl,
    days_active: daysActive,
    multimedia: multimediaUrls.length > 0 ? multimediaUrls : [],
    video_links: causeData.video_links || [],
    summary: causeData.summary || null,
    location: causeData.location || null,
    status: "pending",
  };

  const { data, error } = await supabase
    .from("cause_edits")
    .insert(editData)
    .select()
    .single();

  if (error) {
    console.error("Error saving cause edit:", error);
    throw error;
  }

  if (causeData.sections && causeData.sections.length > 0) {
    const sections = causeData.sections.map((section) => ({
      cause_edit_id: data.id,
      heading: section.heading,
      description: section.description,
    }));

    const { error: sectionsError } = await supabase
      .from("cause_edit_sections")
      .insert(sections);

    if (sectionsError) {
      console.error("Error creating cause edit sections:", sectionsError);
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
      const reviewUrl = `${baseUrl}/dashboard/admin/causes`;

      // Send notification in background - do not await
      sendCauseSubmissionAdminNotification(
        profile.full_name || "User",
        profile.email,
        causeData.title || "Cause Edit",
        reviewUrl,
      ).catch((err) => console.error("Background notification error:", err));
    }
  } catch (error) {
    console.error("Error sending cause edit admin notification:", error);
  }

  revalidatePath("/dashboard/causes");
  return data;
}

/**
 * List causes with filtering options
 */
/**
 * Get causes with filtering options.
 * Using React cache to deduplicate requests in the same render pass.
 */
export const listCauses = cache(async (
  options: CauseFilterOptions = {},
): Promise<Cause[]> => {
  const supabase = await createClient();

  let query = supabase
    .from("causes")
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
      options.offset + (options.limit || 10) - 1,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing causes:", error);
    throw error;
  }

  const causes = (data as Cause[]) || [];

  // Side effect removed from getter to avoid unnecessary POST/UPDATE requests 
  // on every page load. Expiry should be handled by a cleanup job.

  const isOwnerScoped = !!options.userId;
  const result = isOwnerScoped
    ? causes
    : causes.filter((c) => c.status !== ("expired" as any));

  return result;
});

/**
 * Count causes with filtering options
 */
export async function countCauses(
  options: CauseFilterOptions = {},
): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from("causes")
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
    console.error("Error counting causes:", error);
    throw error;
  }

  return count || 0;
}

/**
 * Approve or reject a cause (admin function)
 */
export async function updateCauseStatus(
  causeId: string,
  status: "approved" | "rejected",
  rejectionReason?: string,
): Promise<Cause> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const isAuthorized = await isAdminOrManager(user.id);
  if (!isAuthorized) throw new Error("Unauthorized");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Server configuration error: Missing Supabase keys");
  }

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  if (status === "approved") {
    const { data: edit, error: editError } = await supabaseAdmin
      .from("cause_edits")
      .select("*")
      .eq("original_cause_id", causeId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (editError && editError.code !== "PGRST116") {
      console.error("Error fetching cause edit for approval:", editError);
      throw editError;
    }

    if (edit) {
      const updateData: any = {
        title: edit.title,
        category: edit.category,
        goal: edit.goal,
        image: edit.image,
        days_active: edit.days_active,
        multimedia: edit.multimedia,
        video_links: edit.video_links,
        status: "approved",
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error: updateError } = await supabaseAdmin
        .from("causes")
        .update(updateData)
        .eq("id", causeId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating cause with approved edit:", updateError);
        throw updateError;
      }

      await supabaseAdmin.from("cause_edits").delete().eq("id", edit.id);

      revalidatePath("/dashboard/admin/causes");
      return updated as Cause;
    } else {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("causes")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", causeId)
        .select()
        .single();

      if (updateError) {
        console.error("Error approving cause:", updateError);
        throw updateError;
      }

      revalidatePath("/dashboard/admin/causes");
      return updated as Cause;
    }
  }

  if (status === "rejected") {
    const { data: edit, error: editError } = await supabaseAdmin
      .from("cause_edits")
      .select("*")
      .eq("original_cause_id", causeId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (edit && !editError) {
      await supabaseAdmin
        .from("cause_edits")
        .update({ status: "rejected", rejection_reason: rejectionReason })
        .eq("id", edit.id);
    }

    const { data, error } = await supabaseAdmin
      .from("causes")
      .update({
        status: "rejected",
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", causeId)
      .select()
      .single();

    if (error) {
      console.error("Error updating cause status:", error);
      throw error;
    }

    revalidatePath("/dashboard/admin/causes");
    return data as Cause;
  }

  throw new Error(`Invalid status value: ${status}`);
}

/**
 * Get all pending cause edits for admin review
 */
export async function getCauseEdits(): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cause_edits")
    .select(
      `
      *,
      profiles!inner (
        full_name,
        email,
        profile_photo
      ),
      cause_edit_sections (
        id,
        heading,
        description
      )
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cause edits:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get all causes for a specific user
 */
export async function getUserCauses(userId: string): Promise<Cause[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("causes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user causes:", error);
    throw error;
  }

  return data as Cause[];
}

export async function getUserCausesWithStatus(
  userId: string,
  status?: string,
): Promise<Cause[]> {
  const supabase = await createClient();

  let query = supabase
    .from("causes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching user causes with status:", error);
    throw error;
  }

  return data as Cause[];
}

export async function deleteCause(causeId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("causes").delete().eq("id", causeId);

  if (error) {
    console.error("Error deleting cause:", error);
    throw error;
  }
}

export async function updateCauseTrustMetrics(
  causeId: string,
  metrics: {
    trust_score?: {
      impact: string;
      readability: string;
      transparency: string;
    };
    verified_status?: string;
  },
): Promise<void> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const isAdmin = user?.id ? await isAdminOrManager(user.id) : false;

  if (!isAdmin) {
    throw new Error("Unauthorized: Only admins can update trust metrics");
  }

  const { error } = await supabase
    .from("causes")
    .update({
      trust_score: metrics.trust_score,
      verified_status: metrics.verified_status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", causeId);

  if (error) {
    console.error("Error updating trust metrics:", error);
    throw error;
  }

  revalidatePath("/dashboard/admin/causes");
  revalidatePath(`/causes/${causeId}`);
}

/**
 * Save a cause share to the database
 */
export async function saveCauseShare(
  causeId: string,
  userId?: string,
): Promise<void> {
  const supabase = await createClient();

  const { error: shareError, data: causeData } = await supabase
    .from("causes")
    .select("shared")
    .eq("id", causeId)
    .single();
  if (shareError) {
    console.error("Error saving cause share:", shareError);
    throw shareError;
  }

  const { data: mine, error: causeError } = await supabase
    .from("causes")
    .update({ shared: causeData.shared + 1 })
    .eq("id", causeId)
    .single();

  if (causeError) {
    console.error("Error saving cause share:", causeError);
    throw causeError;
  }

  // Record event for reward tracking if userId provided
  if (userId) {
    try {
      const { recordEvent } = await import("@/actions/event-reward-actions");
      await recordEvent({
        type: "share",
        userId,
        metadata: {
          cause_id: causeId,
        },
      });
    } catch (eventError) {
      console.error("Error recording share event:", eventError);
      // Don't throw - event tracking shouldn't break the main action
    }
  }

  return mine;
}

/**
 * Record a cause share with user tracking
 */
export async function shareCause(
  causeId: string,
  userId: string,
): Promise<void> {
  // Record the share
  await saveCauseShare(causeId, userId);
}

/**
 * Follow a campaign — requires authentication
 * Returns { error: 'unauthenticated' } if no session so the UI can show a login modal
 */
export async function followCampaign(
  causeId: string,
): Promise<{ data: null; error: string } | { data: any; error: null }> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return { data: null, error: "unauthenticated" };
  }

  // Get email from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  if (!profile?.email) {
    return { data: null, error: "No email found for your account." };
  }

  const { data, error } = await supabase
    .from("campaign_follows")
    .upsert(
      {
        cause_id: causeId,
        user_id: user.id,
        email: profile.email,
      },
      { onConflict: "cause_id,email", ignoreDuplicates: true },
    )
    .select();

  if (error && error.code !== "23505") {
    // ignore unique constraint violation (already following)
    return { data: null, error: error.message };
  }

  // data will be empty if ignoreDuplicates triggered
  return { data: (data && data.length > 0) ? data[0] : { already_following: true }, error: null };
}
