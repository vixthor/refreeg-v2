"use server"

import { createClient } from "@/lib/supabase/server"
import { ensureDefaultAdmin } from "./role-actions"

/**
 * Check if a database table exists
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  const supabase = await createClient()


  try {
    const { count } = await supabase.from(tableName).select("*", { count: "exact", head: true }).limit(1)

    return true
  } catch (error: any) {
    if (error.message && error.message.includes("relation") && error.message.includes("does not exist")) {
      return false
    }
    throw error
  }
}

/**
 * Check if all required tables exist
 */
export async function checkDatabaseSetup(): Promise<{
  ready: boolean
  missingTables: string[]
}> {
  const requiredTables = ["profiles", "causes", "donations", "roles"]
  const missingTables: string[] = []

  for (const table of requiredTables) {
    const exists = await checkTableExists(table)
    if (!exists) {
      missingTables.push(table)
    }
  }

  // If all tables exist, ensure the default admin exists
  if (missingTables.length === 0) {
    await ensureDefaultAdmin()
  }

  return {
    ready: missingTables.length === 0,
    missingTables,
  }
}

