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
  searchParams?: Promise<{ search?: string }> | { search?: string };
}) {
  const params = ((await searchParams) || {}) as { search?: string };
  const search = params.search?.trim() || "";

  const user = await getCurrentUser();
  const supabase = await createClient();

  let apiCauses: ApiCauseRow[] = [];
  let apiKeys: ApiKeyRow[] = [];
  let apiCausesUnavailable = false;
  let apiCausesError = "";

  try {
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

    if (causeError) {
      apiCausesUnavailable = true;
      apiCausesError = causeError.message || "Unable to fetch api_campaigns";
    } else {
      apiCauses = ((causeData || []) as any[]).map((row) => ({
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

      if (apiKeyIds.length > 0) {
        const { data: keyData, error: keyError } = await (dbClient as any)
          .from("api_keys")
          .select("id, name, key_prefix, mode")
          .in("id", apiKeyIds);

        if (!keyError) {
          apiKeys = (keyData || []) as ApiKeyRow[];
        }
      }
    }
  } catch (error) {
    apiCausesUnavailable = true;
    apiCausesError = error instanceof Error ? error.message : "Unexpected error";
  }

  const keyMap = new Map(apiKeys.map((key) => [key.id, key]));

  const apiCauseRows = apiCauses.map((cause) => {
    const key = cause.api_key_id ? keyMap.get(cause.api_key_id) : null;
    return {
      ...cause,
      apiName: key?.name || "Unknown API",
      apiPrefix: key?.key_prefix || "N/A",
      apiMode: key?.mode || "unknown",
      developerId: cause.developer_id || "N/A",
    };
  });

  const filteredRows = search
    ? apiCauseRows.filter((row) => {
        const needle = search.toLowerCase();
        return (
          row.title.toLowerCase().includes(needle) ||
          row.apiName.toLowerCase().includes(needle) ||
          row.apiMode.toLowerCase().includes(needle) ||
          row.developerId.toLowerCase().includes(needle)
        );
      })
    : apiCauseRows;

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
          <DashboardStats userId={user?.id} type="all" />
          <DashboardCauses />
          <DashboardPetitions />
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
              <form className="relative w-full md:w-96" method="GET">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search API, developer ID, mode, or cause..."
                  className="pl-8"
                  defaultValue={search}
                />
              </form>

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
                      {filteredRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.apiName}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {row.developerId}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {row.apiMode}
                            </Badge>
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
