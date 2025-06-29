"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useAdmin } from "@/hooks/use-admin"
import { useAdminAnalytics, useAnalyticsCharts } from "@/hooks/use-admin-analytics"
import { BarChart, Users, DollarSign, TrendingUp, RefreshCw, AlertCircle } from "lucide-react"
import { AnalyticsCard } from "@/components/analytics-card"

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isAdminOrManager, isLoading: adminLoading } = useAdmin(user?.id)
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError, refetch } = useAdminAnalytics()
  const { donationTrends, userGrowth, causeCategories, isLoading: chartsLoading, error: chartsError } = useAnalyticsCharts()

  useEffect(() => {
    if (!adminLoading && !isAdminOrManager && user) {
      router.push("/dashboard")
    }
  }, [user, adminLoading, isAdminOrManager, router])

  if (adminLoading || analyticsLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!isAdminOrManager) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You do not have permission to access this page.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (analyticsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Platform statistics and performance metrics.</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading analytics data: {analyticsError}
          </AlertDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Platform statistics and performance metrics.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Donations"
          value={analyticsData?.totalDonations.current || "₦0"}
          description={analyticsData?.totalDonations.percentageChange || "No data"}
          icon={DollarSign}
        />
        <AnalyticsCard
          title="Total Users"
          value={analyticsData?.totalUsers.current?.toString() || "0"}
          description={analyticsData?.totalUsers.percentageChange || "No data"}
          icon={Users}
        />
        <AnalyticsCard
          title="Active Causes"
          value={analyticsData?.activeCauses.current?.toString() || "0"}
          description={analyticsData?.activeCauses.percentageChange || "No data"}
          icon={TrendingUp}
        />
        <AnalyticsCard
          title="Pending Approvals"
          value={analyticsData?.pendingApprovals.current?.toString() || "0"}
          description={analyticsData?.pendingApprovals.percentageChange || "No data"}
          icon={BarChart}
        />
      </div>

      {/* <Tabs defaultValue="donations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="causes">Causes</TabsTrigger>
        </TabsList>

        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Donation Trends</CardTitle>
              <CardDescription>Monthly donation volume over the last 12 months.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center bg-muted/50">
              {chartsLoading ? (
                <div className="text-center">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading donation trends...</p>
                </div>
              ) : chartsError ? (
                <div className="text-center">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
                  <p className="text-muted-foreground">Failed to load donation trends</p>
                </div>
              ) : donationTrends.length > 0 ? (
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Found {donationTrends.length} months of donation data
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Chart visualization will be implemented next
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No donation data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations over the last 12 months.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center bg-muted/50">
              {chartsLoading ? (
                <div className="text-center">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading user growth...</p>
                </div>
              ) : chartsError ? (
                <div className="text-center">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
                  <p className="text-muted-foreground">Failed to load user growth</p>
                </div>
              ) : userGrowth.length > 0 ? (
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Found {userGrowth.length} months of user growth data
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Chart visualization will be implemented next
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No user growth data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="causes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cause Categories</CardTitle>
              <CardDescription>Distribution of causes by category.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center bg-muted/50">
              {chartsLoading ? (
                <div className="text-center">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading cause categories...</p>
                </div>
              ) : chartsError ? (
                <div className="text-center">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
                  <p className="text-muted-foreground">Failed to load cause categories</p>
                </div>
              ) : causeCategories.length > 0 ? (
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Found {causeCategories.length} categories
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {causeCategories.slice(0, 3).map((cat, index) => (
                      <div key={cat.category}>
                        {cat.category}: {cat.count} causes
                      </div>
                    ))}
                    {causeCategories.length > 3 && <div>...</div>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Chart visualization will be implemented next
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No cause categories available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs> */}
    </div>
  )
}

