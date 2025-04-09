"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useAdmin } from "@/hooks/use-admin"
import { BarChart, Users, DollarSign, TrendingUp } from "lucide-react"
import { AnalyticsCard } from "@/components/analytics-card"

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isAdminOrManager, isLoading: adminLoading } = useAdmin(user?.id)

  useEffect(() => {
    if (!adminLoading && !isAdminOrManager && user) {
      router.push("/dashboard")
    }
  }, [user, adminLoading, isAdminOrManager, router])

  if (adminLoading) {
    return <div className="flex justify-center p-8">Loading...</div>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Platform statistics and performance metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Donations"
          value="₦125,500"
          description="+20.1% from last month"
          icon={DollarSign}
        />
        <AnalyticsCard
          title="Total Users"
          value="+42"
          description="+10.1% from last month"
          icon={Users}
        />
        <AnalyticsCard
          title="Active Causes"
          value="12"
          description="+2 new this month"
          icon={TrendingUp}
        />
        <AnalyticsCard
          title="Pending Approvals"
          value="7"
          description="+5 new this week"
          icon={BarChart}
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
              <CardDescription>Monthly donation volume over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center bg-muted/50">
              <p className="text-muted-foreground">Donation chart will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center bg-muted/50">
              <p className="text-muted-foreground">User growth chart will appear here</p>
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
              <p className="text-muted-foreground">Cause categories chart will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

