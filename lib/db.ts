import { createClient } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@/lib/supabase/server"
import type {
  Profile,
  Cause,
  Donation,
  CauseWithUser,
  DonationWithCause,
  CauseFilterOptions,
  ProfileFormData,
  BankDetailsFormData,
  CauseFormData,
  DonationFormData,
} from "@/types"

// Helper to determine if we're on the server
const isServer = typeof window === "undefined"

// Get the appropriate Supabase client based on context
const getClient = () => {
  return isServer ? createServerClient() : createClient()
}

// ==================== PROFILE FUNCTIONS ====================

/**
 * Get a user's profile
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    // If profile doesn't exist, return null instead of throwing
    if (error.code === "PGRST116") {
      return null
    }
    console.error("Error fetching profile:", error)
    throw error
  }

  return data as Profile
}

/**
 * Check if a user has bank details
 */
export async function hasBankDetails(userId: string): Promise<boolean> {
  const profile = await getProfile(userId)
  return !!(profile && profile.account_number && profile.bank_name)
}

/**
 * Update a user's profile
 */
export async function updateProfile(userId: string, profileData: ProfileFormData): Promise<Profile> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      full_name: profileData.name,
      phone: profileData.phone,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error updating profile:", error)
    throw error
  }

  return data as Profile
}

/**
 * Update a user's bank details
 */
export async function updateBankDetails(userId: string, bankData: BankDetailsFormData): Promise<Profile> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      account_number: bankData.accountNumber,
      bank_name: bankData.bankName,
      account_name: bankData.accountName,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error updating bank details:", error)
    throw error
  }

  return data as Profile
}

// ==================== CAUSE FUNCTIONS ====================

/**
 * Get a cause by ID
 */
export async function getCause(causeId: string): Promise<CauseWithUser | null> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from("causes")
    .select(`
      *,
      profiles:user_id (
        full_name
      ),
      auth_users:user_id (
        email
      )
    `)
    .eq("id", causeId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    console.error("Error fetching cause:", error)
    throw error
  }

  // Transform the response to match our CauseWithUser type
  const cause = {
    ...data,
    user: {
      name: data.profiles?.full_name || "Anonymous",
      email: data.auth_users?.email || "",
    },
  } as unknown as CauseWithUser

  // Remove the nested objects that we've flattened
  delete (cause as any).profiles
  delete (cause as any).auth_users

  return cause
}

/**
 * Create a new cause
 */
export async function createCause(userId: string, causeData: CauseFormData): Promise<Cause> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from("causes")
    .insert({
      user_id: userId,
      title: causeData.title,
      description: causeData.description,
      category: causeData.category,
      goal: typeof causeData.goal === "string" ? Number.parseFloat(causeData.goal) : causeData.goal,
      status: "pending", // All causes start as pending
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating cause:", error)
    throw error
  }

  return data as Cause
}

/**
 * Update a cause
 */
export async function updateCause(causeId: string, userId: string, causeData: Partial<CauseFormData>): Promise<Cause> {
  const supabase = getClient()

  // Prepare the update data
  const updateData: any = {
    ...causeData,
    updated_at: new Date().toISOString(),
  }

  // Convert goal to number if it's a string
  if (typeof updateData.goal === "string") {
    updateData.goal = Number.parseFloat(updateData.goal)
  }

  const { data, error } = await supabase
    .from("causes")
    .update(updateData)
    .eq("id", causeId)
    .eq("user_id", userId) // Ensure the user owns this cause
    .select()
    .single()

  if (error) {
    console.error("Error updating cause:", error)
    throw error
  }

  return data as Cause
}

/**
 * List causes with filtering options
 */
export async function listCauses(options: CauseFilterOptions = {}): Promise<Cause[]> {
  const supabase = getClient()

  let query = supabase.from("causes").select("*").order("created_at", { ascending: false })

  // Apply filters
  if (options.category && options.category !== "all") {
    query = query.eq("category", options.category)
  }

  if (options.status) {
    query = query.eq("status", options.status)
  } else {
    // Default to approved causes for public listing
    if (!options.userId) {
      query = query.eq("status", "approved")
    }
  }

  if (options.userId) {
    query = query.eq("user_id", options.userId)
  }

  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error listing causes:", error)
    throw error
  }

  return data as Cause[]
}

/**
 * Count causes with filtering options
 */
export async function countCauses(options: CauseFilterOptions = {}): Promise<number> {
  const supabase = getClient()

  let query = supabase.from("causes").select("id", { count: "exact", head: true })

  // Apply filters
  if (options.category && options.category !== "all") {
    query = query.eq("category", options.category)
  }

  if (options.status) {
    query = query.eq("status", options.status)
  } else {
    // Default to approved causes for public listing
    if (!options.userId) {
      query = query.eq("status", "approved")
    }
  }

  if (options.userId) {
    query = query.eq("user_id", options.userId)
  }

  const { count, error } = await query

  if (error) {
    console.error("Error counting causes:", error)
    throw error
  }

  return count || 0
}

/**
 * Approve or reject a cause (admin function)
 */
export async function updateCauseStatus(
  causeId: string,
  status: "approved" | "rejected",
  rejectionReason?: string,
): Promise<Cause> {
  const supabase = getClient()

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === "rejected" && rejectionReason) {
    updateData.rejection_reason = rejectionReason
  }

  const { data, error } = await supabase.from("causes").update(updateData).eq("id", causeId).select().single()

  if (error) {
    console.error("Error updating cause status:", error)
    throw error
  }

  return data as Cause
}

// ==================== DONATION FUNCTIONS ====================

/**
 * Create a new donation
 */
export async function createDonation(
  causeId: string,
  userId: string | null,
  donationData: DonationFormData,
): Promise<Donation> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from("donations")
    .insert({
      cause_id: causeId,
      user_id: userId,
      amount: typeof donationData.amount === "string" ? Number.parseFloat(donationData.amount) : donationData.amount,
      name: donationData.isAnonymous ? "Anonymous" : donationData.name,
      email: donationData.email,
      message: donationData.message || null,
      is_anonymous: donationData.isAnonymous,
      status: "completed", // For now, all donations are immediately completed
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating donation:", error)
    throw error
  }

  return data as Donation
}

/**
 * List donations for a cause
 */
export async function listDonationsForCause(causeId: string): Promise<Donation[]> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .eq("cause_id", causeId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error listing donations:", error)
    throw error
  }

  return data as Donation[]
}

/**
 * List donations for a user
 */
export async function listUserDonations(
  userId: string,
  timeframe: "all" | "recent" = "all",
): Promise<DonationWithCause[]> {
  const supabase = getClient()

  let query = supabase
    .from("donations")
    .select(`
      *,
      causes:cause_id (
        title,
        category
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (timeframe === "recent") {
    // Get donations from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    query = query.gte("created_at", thirtyDaysAgo.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error("Error listing user donations:", error)
    throw error
  }

  // Transform the response to match our DonationWithCause type
  return data.map((item:any) => ({
    ...item,
    cause: {
      title: item.causes?.title || "Unknown Cause",
      category: item.causes?.category || "Unknown",
    },
  })) as DonationWithCause[]
}

/**
 * Get total amount donated by a user
 */
export async function getTotalDonated(userId: string): Promise<number> {
  const supabase = getClient()

  const { data, error } = await supabase.from("donations").select("amount").eq("user_id", userId)

  if (error) {
    console.error("Error getting total donated:", error)
    throw error
  }

  return data.reduce((sum: any, donation: { amount: any }) => sum + donation.amount, 0)
}

/**
 * Get donation statistics for a user
 */
export async function getUserDonationStats(userId: string) {
  const supabase = getClient()

  // Get total donated
  const { data: totalData, error: totalError } = await supabase.from("donations").select("amount").eq("user_id", userId)

  if (totalError) {
    console.error("Error getting donation stats:", totalError)
    throw totalError
  }

  const totalDonated = totalData.reduce((sum: any, donation: { amount: any }) => sum + donation.amount, 0)

  // Get donation count
  const { count, error: countError } = await supabase
    .from("donations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)

  if (countError) {
    console.error("Error getting donation count:", countError)
    throw countError
  }

  // Get recent donation trend (last 3 months by month)
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const { data: recentData, error: recentError } = await supabase
    .from("donations")
    .select("amount, created_at")
    .eq("user_id", userId)
    .gte("created_at", threeMonthsAgo.toISOString())
    .order("created_at", { ascending: true })

  if (recentError) {
    console.error("Error getting recent donations:", recentError)
    throw recentError
  }

  // Group by month
  const monthlyDonations: Record<string, number> = {}

  recentData.forEach((donation: { created_at: string | number | Date; amount: number }) => {
    const date = new Date(donation.created_at)
    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`

    if (!monthlyDonations[monthYear]) {
      monthlyDonations[monthYear] = 0
    }

    monthlyDonations[monthYear] += donation.amount
  })

  return {
    totalDonated,
    donationCount: count || 0,
    monthlyDonations,
  }
}

// ==================== DASHBOARD STATS FUNCTIONS ====================

/**
 * Get dashboard statistics for a user
 */
export async function getUserDashboardStats(userId: string) {
  const supabase = getClient()

  // Get total raised across all user's causes
  const { data: causesData, error: causesError } = await supabase.from("causes").select("raised").eq("user_id", userId)

  if (causesError) {
    console.error("Error getting user causes:", causesError)
    throw causesError
  }

  const totalRaised = causesData.reduce((sum: any, cause: { raised: any }) => sum + cause.raised, 0)

  // Get total donors count (unique donors to user's causes)
  const { data: donorsData, error: donorsError } = await supabase
    .from("donations")
    .select("email")
    .in(
      "cause_id",
      causesData.map((cause: { id: any }) => cause.id),
    )
    .order("email")

  if (donorsError) {
    console.error("Error getting donors:", donorsError)
    throw donorsError
  }

  // Count unique donors
  const uniqueDonors = new Set(donorsData.map((d: { email: any }) => d.email)).size

  // Get active causes count
  const { count: activeCausesCount, error: activeError } = await supabase
    .from("causes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "approved")

  if (activeError) {
    console.error("Error getting active causes count:", activeError)
    throw activeError
  }

  return {
    totalRaised,
    uniqueDonors,
    activeCausesCount: activeCausesCount || 0,
  }
}

// ==================== DATABASE UTILITIES ====================

/**
 * Check if a database table exists
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  const supabase = getClient()

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
  const requiredTables = ["profiles", "causes", "donations"]
  const missingTables: string[] = []

  for (const table of requiredTables) {
    const exists = await checkTableExists(table)
    if (!exists) {
      missingTables.push(table)
    }
  }

  return {
    ready: missingTables.length === 0,
    missingTables,
  }
}

