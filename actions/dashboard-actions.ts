import { createClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"

export async function getDashboardStats(userId: string) {
    const supabase = await createClient()

    // Get total raised from donations
    const { data: donations, error: donationsError } = await supabase
        .from("donations")
        .select("amount")
        .eq("user_id", userId)

    if (donationsError) {
        console.error("Error fetching donations:", donationsError)
        return {
            totalRaised: 0,
            totalDonors: 0,
            activeCauses: 0,
        }
    }

    const totalRaised = donations.reduce((sum, donation) => sum + donation.amount, 0)

    // Get total donors
    const { data: donors, error: donorsError } = await supabase
        .from("donations")
        .select("user_id", { count: "exact" })
        .eq("user_id", userId)
        .order("user_id")

    if (donorsError) {
        console.error("Error fetching donors:", donorsError)
        return {
            totalRaised,
            totalDonors: 0,
            activeCauses: 0,
        }
    }

    // Get active causes
    const { data: causes, error: causesError } = await supabase
        .from("causes")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "approved")

    if (causesError) {
        console.error("Error fetching causes:", causesError)
        return {
            totalRaised,
            totalDonors: donors?.length || 0,
            activeCauses: 0,
        }
    }

    return {
        totalRaised: formatCurrency(totalRaised),
        totalDonors: donors?.length || 0,
        activeCauses: causes?.length || 0,
    }
}

export async function getDonationTrends(userId: string) {
    const supabase = await createClient()

    // Get donations for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: donations, error } = await supabase
        .from("donations")
        .select("amount, created_at")
        .eq("user_id", userId)
        .gte("created_at", sixMonthsAgo.toISOString())
        .order("created_at", { ascending: true })

    if (error) {
        console.error("Error fetching donation trends:", error)
        return []
    }

    // Group donations by month
    const monthlyDonations = donations.reduce((acc, donation) => {
        const date = new Date(donation.created_at)
        const month = date.toLocaleString("default", { month: "short", year: "numeric" })

        if (!acc[month]) {
            acc[month] = 0
        }
        acc[month] += donation.amount
        return acc
    }, {} as Record<string, number>)

    // Convert to array format for chart
    return Object.entries(monthlyDonations).map(([month, amount]) => ({
        month,
        amount,
    }))
}

export async function getUserCauses(userId: string, status?: string) {
    const supabase = await createClient()

    let query = supabase
        .from("causes")
        .select("*")
        .eq("user_id", userId)

    if (status && status !== "all") {
        query = query.eq("status", status)
    }

    const { data: causes, error } = await query.order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching user causes:", error)
        return []
    }

    return causes
} 