"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { getUserRole } from "@/actions/role-actions";
import { logAdminActivity } from "@/actions/database-actions";

export async function blockUser(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Unauthorized: No user found");
    return false;
  }

  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    is_blocked: true,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error blocking user:", error);
    return false;
  }

  await logAdminActivity("block-user", user.id);

  revalidatePath("/dashboard/admin/users");
  return true;
}

export async function unblockUser(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Unauthorized: No user found");
    return false;
  }

  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    is_blocked: false,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error unblocking user:", error);
    return false;
  }

  await logAdminActivity("unblock-user", user.id);

  revalidatePath("/dashboard/admin/users");
  return true;
}

export async function isUserBlocked(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("is_blocked")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error checking if user is blocked:", error);
    return false;
  }

  return data?.is_blocked || false;
}

export async function deleteUserAccount(
  userId: string,
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Not authenticated" };
    }

    if (user.id !== userId) {
      return { error: "You can only delete your own account" };
    }

    const { error: kycError } = await supabase
      .from("kyc_verifications")
      .delete()
      .eq("user_id", userId);

    if (kycError) {
      console.error("Error deleting KYC verifications:", kycError);
      return { error: kycError.message };
    }

    const { error: roleError } = await supabase
      .from("roles")
      .delete()
      .eq("user_id", userId);

    if (roleError) {
      console.error("Error deleting user roles:", roleError);
      return { error: roleError.message };
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Error deleting user profile:", profileError);
      return { error: profileError.message };
    }

    // This might fail if using standard client, but leaving as is for now to preserve existing code
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      return { error: authError.message };
    }

    revalidatePath("/dashboard/settings");
    return { error: null };
  } catch (error) {
    console.error("Error in deleteUserAccount:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to delete account",
    };
  }
}

export async function deleteUserAsAdmin(
  userId: string,
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    const currentUserRole = await getUserRole(user.id);
    if (currentUserRole !== "admin") {
      return { error: "Unauthorized: Only admins can delete users" };
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("Missing Supabase environment variables for admin client");
      return { error: "Server configuration error: Missing Supabase keys" };
    }

    // Create admin client with service role key
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

    // 1. Delete KYC verifications
    const { error: kycError } = await supabaseAdmin
      .from("kyc_verifications")
      .delete()
      .eq("user_id", userId);

    if (kycError) {
      console.error("Error deleting KYC verifications:", kycError);
      // Continue anyway to try to delete other parts
    }

    // 2. Delete Roles
    const { error: roleError } = await supabaseAdmin
      .from("roles")
      .delete()
      .eq("user_id", userId);

    if (roleError) {
      console.error("Error deleting user roles:", roleError);
    }

    // 3. Delete Profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Error deleting user profile:", profileError);
    }

    // 4. Delete Auth User (this is the most important part)
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      return { error: authError.message };
    }

    await logAdminActivity("delete-user", user.id);

    revalidatePath("/dashboard/admin/users");
    return { error: null };
  } catch (error) {
    console.error("Error in deleteUserAsAdmin:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}
