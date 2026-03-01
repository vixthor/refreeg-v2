"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UserRole, UserWithRole } from "@/types";
import { logAdminActivity } from "@/actions/database-actions";

const DEFAULT_ADMIN_EMAIL = "kingraj1344@gmail.com";

export async function getUserRoleInfo(userId: string): Promise<{
  isAdmin: boolean;
  isManager: boolean;
  role: UserRole;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error getting user role info:", error);
    return {
      isAdmin: false,
      isManager: false,
      role: "user",
    };
  }

  const role = data?.role || "user";
  return {
    isAdmin: role === "admin",
    isManager: role === "manager" || role === "admin",
    role,
  };
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { isAdmin } = await getUserRoleInfo(userId);
  return isAdmin;
}

export async function isManager(userId: string): Promise<boolean> {
  const { isManager } = await getUserRoleInfo(userId);
  return isManager;
}

export async function isAdminOrManager(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error checking admin/manager status:", error);
    return false;
  }

  return data?.role === "admin" || data?.role === "manager";
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const { role } = await getUserRoleInfo(userId);
  return role;
}

export async function setUserRole(
  userId: string,
  role: UserRole,
): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error getting current user:", userError);
    return false;
  }

  const { data: currentUserRole } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (currentUserRole?.role !== "admin") {
    console.error("Only admins can set roles");
    return false;
  }

  const { data: existingRole } = await supabase
    .from("roles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  let result;

  if (existingRole) {
    result = await supabase
      .from("roles")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } else {
    result = await supabase.from("roles").insert({
      user_id: userId,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  if (result.error) {
    console.error("Error setting user role:", result.error);
    return false;
  }

  if (role === "manager") {
    await logAdminActivity("appoint-manager", user.id);
  } else if (role === "user") {
    await logAdminActivity("remove-manager", user.id);
  } else if (role === "admin") {
    await logAdminActivity("appoint-admin", user.id);
  }

  revalidatePath("/dashboard/admin/users");
  return true;
}

export async function listUsersWithRoles(): Promise<UserWithRole[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error getting current user:", userError);
    throw new Error("Not authenticated");
  }

  // Check if current user is admin
  const { data: currentUserRole } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    currentUserRole?.role !== "admin" &&
    currentUserRole?.role !== "manager"
  ) {
    throw new Error("Only admins or managers can list users");
  }

  // Get profiles with roles (simplified query to avoid join issues)
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      username,
      is_blocked,
      created_at
    `,
    )
    .order("created_at", { ascending: false });

  if (profilesError) {
    console.error("Error listing profiles:", profilesError);
    throw profilesError;
  }

  // Get roles separately to avoid join issues
  let rolesData: any[] = [];
  try {
    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select("user_id, role");

    if (!rolesError && roles) {
      rolesData = roles;
    }
  } catch (rolesError) {
    console.warn("Error fetching roles:", rolesError);
  }

  // Get KYC data separately
  let kycData: any[] = [];
  try {
    const { data: kyc, error: kycError } = await supabase
      .from("kyc_verifications")
      .select("user_id, status, id")
      .order("created_at", { ascending: false });

    if (!kycError && kyc) {
      kycData = kyc;
    }
  } catch (kycError) {
    console.warn("Error fetching KYC data:", kycError);
  }

  // Create maps for efficient lookup
  const rolesMap = new Map();
  rolesData.forEach((role) => {
    rolesMap.set(role.user_id, role.role);
  });

  const kycMap = new Map();
  kycData.forEach((kyc) => {
    if (!kycMap.has(kyc.user_id)) {
      kycMap.set(kyc.user_id, { status: kyc.status, id: kyc.id });
    }
  });

  // Map profiles to UserWithRole
  return (
    profiles?.map((profile) => {
      // Get role and KYC data from the maps
      const userRole = rolesMap.get(profile.id) || "user";
      const kycData = kycMap.get(profile.id);

      return {
        id: profile.id,
        email: profile.email || "",
        role: userRole,
        is_blocked: profile.is_blocked || false,
        full_name: profile.full_name || null,
        username: profile.username || null,
        created_at: profile.created_at,
        kyc_status: kycData?.status || null,
        kyc_verification_id: kycData?.id || null,
      };
    }) || []
  );
}

/**
 * Ensure default admin exists
 */
export async function ensureDefaultAdmin(): Promise<void> {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error getting current user:", userError);
    return;
  }

  // If the current user's email matches the default admin email, set them as admin
  if (user?.email === DEFAULT_ADMIN_EMAIL) {
    // Check if the user already has an admin role
    const { data: roleData } = await supabase
      .from("roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!roleData) {
      // Set the user as an admin
      await setUserRole(user.id, "admin");
    }
  }
}

/**
 * Get all users from profiles
 */
export async function getAllUsers(): Promise<UserWithRole[]> {
  const supabase = await createClient();

  const { data: profiles, error: profilesError } = await supabase.from(
    "profiles",
  ).select(`
      id,
      full_name,
      email,
      is_blocked,
      created_at,
      roles (
        role
      )
    `);

  if (profilesError) {
    console.error("Error listing profiles:", profilesError);
    throw profilesError;
  }

  // Map profiles to UserWithRole
  return profiles.map((profile) => ({
    id: profile.id,
    email: profile.email || "",
    role: profile.roles?.[0]?.role || "user",
    is_blocked: profile.is_blocked || false,
    full_name: profile.full_name || null,
    created_at: profile.created_at,
  }));
}

/**
 * Get all admin and manager email addresses
 */
export async function getAdminManagerEmails(): Promise<string[]> {
  const supabase = await createClient();

  try {
    // Get all roles that are admin or manager
    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select("user_id")
      .in("role", ["admin", "manager"]);

    if (rolesError) {
      console.error("Error fetching admin/manager roles:", rolesError);
      return [];
    }

    if (!roles || roles.length === 0) {
      return [];
    }

    // Get email addresses for these users
    const userIds = roles.map((role) => role.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("email")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching admin/manager emails:", profilesError);
      return [];
    }

    // Filter out null/empty emails and return array
    return (
      profiles
        ?.map((profile) => profile.email)
        .filter((email): email is string => !!email) || []
    );
  } catch (error) {
    console.error("Error in getAdminManagerEmails:", error);
    return [];
  }
}
