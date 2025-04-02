"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Get the current user session
 */
export async function getCurrentUser() {
  const supabase = await
    createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user || null
}

