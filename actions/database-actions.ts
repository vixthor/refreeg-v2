"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureDefaultAdmin } from "./role-actions";

type Action =
  | "approve-cause"
  | "reject-cause"
  | "approve-petition"
  | "reject-petition"
  | "block-user"
  | "unblock-user"
  | "appoint-manager"
  | "remove-manager"
  | "delete-user"
  | "approve-kyc"
  | "reject-kyc"
  | "send-kyc-reminders"
  | "appoint-admin";

export async function checkTableExists(tableName: string): Promise<boolean> {
  const supabase = await createClient();

  try {
    const { count } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true })
      .limit(1);

    return true;
  } catch (error: any) {
    if (
      error.message &&
      error.message.includes("relation") &&
      error.message.includes("does not exist")
    ) {
      return false;
    }
    throw error;
  }
}

export async function checkDatabaseSetup(): Promise<{
  ready: boolean;
  missingTables: string[];
}> {
  const requiredTables = [
    "profiles",
    "causes",
    "donations",
    "roles",
    "cause_multimedia",
    "logs",
  ];
  const missingTables: string[] = [];

  for (const table of requiredTables) {
    const exists = await checkTableExists(table);
    if (!exists) {
      missingTables.push(table);
    }
  }

  if (missingTables.length === 0) {
    await ensureDefaultAdmin();
  }

  return {
    ready: missingTables.length === 0,
    missingTables,
  };
}

export const logAdminActivity = async (action: Action, adminId: string) => {
  const supabase = await createClient();

  await supabase.from("logs").insert({
    action,
    admin_id: adminId,
    created_at: new Date().toISOString(),
  });
};

export async function listAdminLogs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("logs")
    .select("id, action, created_at, profiles:admin_id(email)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin logs:", error);
    throw error;
  }

  return (data || []).map((log: any) => {
    const profile = Array.isArray(log.profiles)
      ? log.profiles[0]
      : log.profiles;
    return {
      email: profile?.email || "Unknown User",
      action: log.action || "Unknown Action",
      created_at: log.created_at || new Date().toISOString(),
    };
  });
}
