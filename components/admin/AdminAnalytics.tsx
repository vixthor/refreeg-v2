"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { useAdminAnalytics, useAnalyticsCharts } from "@/hooks/use-admin-analytics";
import { BarChart, Users, DollarSign, TrendingUp, Activity } from "lucide-react";
import { AnalyticsCard } from "@/components/analytics-card";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function AdminAnalytics() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdminOrManager, isLoading: adminLoading } = useAdmin(user?.id);
  
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useAdminAnalytics();

  const {
    donationTrends,
    userGrowth,
    causeCategories,
    isLoading: chartsLoading,
  } = useAnalyticsCharts();

  useEffect(() => {
    if (!adminLoading && !isAdminOrManager && user) {
      router.push("/dashboard");
    }
  }, [user, adminLoading, isAdminOrManager, router]);

  if (adminLoading || analyticsLoading || chartsLoading) {
    return <div className="flex justify-center p-8">Loading analytics data...</div>;
  }

  if (!isAdminOrManager) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (analyticsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Failed to load analytics data: {analyticsError}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data</CardTitle>
          <CardDescription>Unable to load analytics data.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Platform statistics and performance metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Donations"
          value={analytics.totalDonations.current}
          description={`${analytics.totalDonations.trend > 0 ? '+' : ''}${analytics.totalDonations.trend}% from last month`}
          icon={DollarSign}
        />
        <AnalyticsCard
          title="Total Users"
          value={String(analytics.totalUsers.current)}
          description={`+${analytics.totalUsers.newThisMonth} new this month`}
          icon={Users}
        />
        <AnalyticsCard
          title="Active Causes"
          value={`${analytics.activeCauses.active} / ${analytics.activeCauses.total}`}
          description="Active / Total Causes"
          icon={Activity}
        />
        <AnalyticsCard
          title="Pending Approvals"
          value={String(analytics.pendingApprovals.current)}
          description="Requires attention"
          icon={TrendingUp}
        />
      </div>

      <Tabs defaultValue="donations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="causes">Causes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Donation Trends</CardTitle>
              <CardDescription>
                Monthly donation volume (Regular vs Crypto)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={donationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `₦${Number(value).toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="regular" name="Regular (₦)" stackId="a" fill="#2563eb" />
                  <Bar dataKey="crypto" name="Crypto (₦)" stackId="a" fill="#16a34a" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                New user registrations per month
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    name="New Users" 
                    stroke="#2563eb" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="active" 
                    name="Active (Updated)" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="causes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Causes by Category</CardTitle>
                <CardDescription>
                  Distribution of total causes
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={causeCategories} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name="Total Causes" fill="#8884d8" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>
                  Approved vs Pending vs Completed
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={causeCategories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="approved" name="Approved" stackId="a" fill="#16a34a" />
                    <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="completed" name="Completed" stackId="a" fill="#2563eb" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}