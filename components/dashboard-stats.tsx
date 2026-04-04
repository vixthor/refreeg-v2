import { Users, CreditCard, TrendingUp } from "lucide-react";
import { AnalyticsCard } from "@/components/analytics-card";
import {
  getDashboardStats,
  getPetitionDashboardStats,
} from "@/actions/dashboard-actions";

export async function DashboardStats({
  type = "all",
  userId,
  initialStats,
  initialPetitionStats,
}: {
  type?: "cause" | "petition" | "all";
  userId?: string;
  initialStats?: any;
  initialPetitionStats?: any;
}) {
  if (!userId) return null;
  
  let stats = initialStats;
  if (!stats && (type === "cause" || type === "all")) {
    stats = await getDashboardStats(userId);
  }
  
  let petitionStats = initialPetitionStats;
  if (!petitionStats && (type === "petition" || type === "all")) {
    petitionStats = await getPetitionDashboardStats(userId);
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats && (
        <>
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
        </>
      )}
      {petitionStats && (
        <>
          <AnalyticsCard
            title="Unique Signers"
            value={petitionStats.totalDonors ?? 0}
            description="Total number of unique petition signers"
            icon={Users}
          />
          <AnalyticsCard
            title="Active Petitions"
            value={petitionStats.activePetitions ?? 0}
            description="Number of approved petitions"
            icon={TrendingUp}
          />
        </>
      )}
    </div>
  );
}
