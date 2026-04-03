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
import { DashboardPetitions } from "@/components/dashboard-petitions";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Satellite } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { getCachedUser } from "@/lib/supabase/cached-user";
import { ApiCausesFilter } from "@/components/dashboard/ApiCausesFilter";
import { redirect } from "next/navigation";
import { 
  getDashboardStats, 
  getPetitionDashboardStats, 
  getUserCausesWithStats, 
  getUserPetitionsWithStats 
} from "@/actions/dashboard-actions";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Manage your causes, petitions, and track your social impact on RefreeG.",
};

type ApiCauseRow = {
  id: string;
  developer_id?: string;
  title: string;
  status: string;
  created_at: string;
  api_key_id: string | null;
  mode?: string;
  goal_amount?: number;
  raised_amount?: number;
};

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  mode: "live" | "test";
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; mode?: string }> | { search?: string; mode?: string };
}) {
  const params = ((await searchParams) || {}) as { search?: string; mode?: string };
  const search = params.search?.trim() || "";
  const modeFilter = params.mode || "all";

  const [
    authResult,
    stats,
    petitionStats,
    userCauses,
    userPetitions,
    apiCampaignsResult
  ] = await Promise.all([
    getCachedUser(),
    (async () => { 
      const { user } = await getCachedUser(); 
      return user ? getDashboardStats(user.id) : null; 
    })(),
    (async () => {
      const { user } = await getCachedUser();
      return user ? getPetitionDashboardStats(user.id) : null;
    })(),
    (async () => {
      const { user } = await getCachedUser();
      return user ? getUserCausesWithStats(user.id) : [];
    })(),
    (async () => {
      const { user } = await getCachedUser();
      return user ? getUserPetitionsWithStats(user.id) : [];
    })(),
    (async () => {
      try {
        const supabase = await createClient();
        const canUseServiceRole =
          !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
          !!process.env.SUPABASE_SERVICE_ROLE_KEY;

        const dbClient = canUseServiceRole
          ? createSupabaseAdmin(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!,
              {
                auth: {
                  autoRefreshToken: false,
                  persistSession: false,
                },
              },
            )
          : (supabase as any);

        const { data: causeData, error: causeError } = await (dbClient as any)
          .from("api_campaigns")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (causeError) return { error: causeError.message };
        
        const apiCauses = ((causeData || []) as any[]).map((row) => ({
          id: row.id,
          developer_id: row.developer_id,
          title: row.title || row.name || "Untitled cause",
          status: row.status || "unknown",
          created_at: row.created_at,
          api_key_id: row.api_key_id ?? null,
          mode: row.mode,
          goal_amount: row.goal_amount,
          raised_amount: row.raised_amount,
        }));

        const apiKeyIds = [
          ...new Set(
            apiCauses
              .map((cause) => cause.api_key_id)
              .filter((id): id is string => Boolean(id)),
          ),
        ];

        let apiKeys: ApiKeyRow[] = [];
        if (apiKeyIds.length > 0) {
          const { data: keyData, error: keyError } = await (dbClient as any)
            .from("api_keys")
            .select("id, name, key_prefix, mode")
            .in("id", apiKeyIds);

          if (!keyError) {
            apiKeys = (keyData || []) as ApiKeyRow[];
          }
        }

        return { apiCauses, apiKeys };
      } catch (err) {
        return { error: err instanceof Error ? err.message : "Unexpected error" };
      }
    })()
  ]);

  const { user, error: authError } = authResult;

  if (!user || authError) {
    redirect("/auth/signin");
  }

  const apiCauses = 'apiCauses' in apiCampaignsResult ? (apiCampaignsResult as any).apiCauses : [];
  const apiKeys = 'apiKeys' in apiCampaignsResult ? (apiCampaignsResult as any).apiKeys : [];
  const apiCausesUnavailable = 'error' in apiCampaignsResult;
  const apiCausesError = 'error' in apiCampaignsResult ? (apiCampaignsResult as any).error : "";

  const keyMap = new Map(apiKeys.map((key: any) => [key.id, key]));

  const apiCauseRows = apiCauses.map((cause: any) => {
    const key = cause.api_key_id ? keyMap.get(cause.api_key_id) as ApiKeyRow | undefined : null;
    return {
      ...cause,
      apiName: key?.name || "Unknown API",
      apiPrefix: key?.key_prefix || "N/A",
      apiMode: cause.mode || key?.mode || "unknown",
      developerId: cause.developer_id || "N/A",
    };
  });


  const filteredRows = apiCauseRows.filter((row: any) => {
    let matchesSearch = true;
    let matchesMode = true;

    if (search) {
      const needle = search.toLowerCase();
      matchesSearch =
        row.title.toLowerCase().includes(needle) ||
        row.apiName.toLowerCase().includes(needle) ||
        row.apiMode.toLowerCase().includes(needle) ||
        row.developerId.toLowerCase().includes(needle);
    }

    if (modeFilter !== "all") {
      matchesMode = row.apiMode === modeFilter;
    }

    return matchesSearch && matchesMode;
  });

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

      <Tabs defaultValue={search ? "analytics" : "overview"} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="overview" className="text-sm sm:text-base">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm sm:text-base">
            Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <DashboardStats 
            userId={user.id} 
            type="all" 
            initialStats={stats} 
            initialPetitionStats={petitionStats} 
          />
          <DashboardCauses initialCauses={userCauses} />
          <DashboardPetitions initialPetitions={userPetitions} />
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Satellite className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">API Causes</CardTitle>
                </div>
                {!apiCausesUnavailable && (
                  <Badge variant="secondary">{filteredRows.length} shown</Badge>
                )}
              </div>
              <CardDescription className="text-sm">
                Separate table of APIs and causes created with them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ApiCausesFilter search={search} modeFilter={modeFilter} />

              {apiCausesUnavailable ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    API cause data is not available yet.
                  </p>
                  {apiCausesError ? (
                    <p className="text-xs text-muted-foreground">{apiCausesError}</p>
                  ) : null}
                </div>
              ) : filteredRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No API causes found{search ? ` for "${search}"` : ""}.
                </p>
              ) : (
                <div className="rounded-md border bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>API</TableHead>
                        <TableHead>Developer ID</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Cause</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRows.map((row: any) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.apiName}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {row.developerId}
                          </TableCell>
                          <TableCell>
                            {row.apiMode === "test" ? (
                              <Badge variant="outline" className="capitalize text-amber-600 border-amber-200 bg-amber-50 font-bold tracking-tight">
                                Test
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="capitalize">
                                Live
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[260px] truncate">
                            {row.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {row.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(row.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {apiCausesUnavailable && (
                <div className="rounded-md border bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>API</TableHead>
                        <TableHead>Developer ID</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Cause</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-sm text-muted-foreground py-6 text-center"
                        >
                          No rows to display
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

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
