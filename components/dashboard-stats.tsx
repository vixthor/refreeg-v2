import { Users, CreditCard, TrendingUp } from "lucide-react"
import { AnalyticsCard } from "@/components/analytics-card"
import { getDashboardStats } from "@/actions/dashboard-actions"
import { getCurrentUser } from "@/actions/auth-actions"

export async function DashboardStats() {
  const user = await getCurrentUser()
  if (!user) return null

  const stats = await getDashboardStats(user.id)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AnalyticsCard
        title="Total Raised"
        value={stats.totalRaised}
        description="Total amount raised from donations"
        icon={CreditCard}
      />
      <AnalyticsCard
        title="Total Donors"
        value={stats.totalDonors}
        description="Total number of unique donors"
        icon={Users}
      />
      <AnalyticsCard
        title="Active Causes"
        value={stats.activeCauses}
        description="Number of approved causes"
        icon={TrendingUp}
      />
    </div>
  )
}

