import { Users, CreditCard, TrendingUp } from "lucide-react"
import { AnalyticsCard } from "@/components/analytics-card"

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AnalyticsCard
        title="Total Raised"
        value="₦25,500"
        description="+20.1% from last month"
        icon={CreditCard}
      />
      <AnalyticsCard
        title="Total Donors"
        value="+12"
        description="+10.1% from last month"
        icon={Users}
      />
      <AnalyticsCard
        title="Active Causes"
        value="3"
        description="+2 new this month"
        icon={TrendingUp}
      />
    </div>
  )
}

