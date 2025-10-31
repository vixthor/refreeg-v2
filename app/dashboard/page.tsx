import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardCauses } from "@/components/dashboard-causes";
import { DashboardStats } from "@/components/dashboard-stats";
import { getCurrentUser } from "@/actions/auth-actions";
import { DashboardPetitions } from "@/components/dashboard-petitions";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Welcome to your dashboard. Here you can manage your causes and track
          your progress.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="overview" className="text-sm sm:text-base">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm sm:text-base">
            Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <DashboardStats userId={user?.id} type="all" />
          <DashboardCauses />
          <DashboardPetitions />
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Donation Trends
              </CardTitle>
              <CardDescription className="text-sm">
                View your donation activity over time.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px] flex items-center justify-center bg-muted/50">
              <p className="text-sm sm:text-base text-muted-foreground text-center px-4">
                Donation chart will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
