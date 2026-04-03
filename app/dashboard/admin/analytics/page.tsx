import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, Satellite, Layers3, KeyRound, Globe, FlaskConical } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/actions/role-actions";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const AdminAnalytics = dynamic(
  () => import("@/components/admin/AdminAnalytics"),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    ),
  },
);

type ApiCauseRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  api_key_id: string | null;
};

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  mode: "live" | "test";
};

import { getCachedUser } from "@/lib/supabase/cached-user";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }> | { search?: string };
}) {
  const params = await searchParams;
  const search = params?.search?.trim() || "";

  const { user, error: authError } = await getCachedUser();

  if (!user || authError) {
    redirect("/auth/signin");
  }

  const role = await getUserRole(user.id);

  if (!role || (role !== "admin" && role !== "manager")) {
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

  const supabase = await createClient();

  // Parallel fetching for performance
  const [apiCampaignsResult] = await Promise.all([
    (async () => {
      try {
        const { data: apiCauses, error: causeError } = await (supabase as any)
          .from("api_campaigns")
          .select("id, title, status, created_at, api_key_id")
          .order("created_at", { ascending: false })
          .limit(50);

        if (causeError) return { error: causeError.message };

        const apiKeyIds = [
          ...new Set(
            (apiCauses || [])
              .map((cause: any) => cause.api_key_id)
              .filter((id: any): id is string => Boolean(id)),
          ),
        ];

        let apiKeys: ApiKeyRow[] = [];
        if (apiKeyIds.length > 0) {
          const { data: keysData, error: keysError } = await (supabase as any)
            .from("api_keys")
            .select("id, name, key_prefix, mode")
            .in("id", apiKeyIds);

          if (!keysError) {
            apiKeys = (keysData || []) as ApiKeyRow[];
          }
        }

        return { apiCauses: (apiCauses || []), apiKeys };
      } catch (err: any) {
        return { error: err.message || "Failed to fetch API data" };
      }
    })()
  ]);

  const apiCauses = 'apiCauses' in apiCampaignsResult ? (apiCampaignsResult as any).apiCauses : [];
  const apiKeys = 'apiKeys' in apiCampaignsResult ? (apiCampaignsResult as any).apiKeys : [];
  const apiCausesUnavailable = 'error' in apiCampaignsResult;

  const keyMap = new Map(apiKeys.map((key: any) => [key.id, key]));

  const apiCauseRows = apiCauses.map((cause: any) => {
    const key = cause.api_key_id ? keyMap.get(cause.api_key_id) as ApiKeyRow | undefined : null;
    return {
      ...cause,
      apiName: key?.name || "Unknown API",
      apiPrefix: key?.key_prefix || "N/A",
      apiMode: key?.mode || "unknown",
    };
  });

  const filteredRows = search
    ? apiCauseRows.filter((row: any) => {
        const needle = search.toLowerCase();
        return (
          row.title.toLowerCase().includes(needle) ||
          row.apiName.toLowerCase().includes(needle) ||
          row.apiPrefix.toLowerCase().includes(needle) ||
          row.apiMode.toLowerCase().includes(needle)
        );
      })
    : apiCauseRows;

  const totalCauses = apiCauseRows.length;
  const uniqueApis = new Set(apiCauseRows.map((row: any) => row.apiPrefix)).size;
  const liveCauses = apiCauseRows.filter((row: any) => row.apiMode === "live").length;
  const testCauses = apiCauseRows.filter((row: any) => row.apiMode === "test").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Analytics</h1>
          <p className="text-muted-foreground">Monitor platform performance and API metrics.</p>
        </div>
        <div className="flex gap-2">
           <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/admin/api-monitoring">Detailed API Reports</Link>
          </Button>
        </div>
      </div>

      {!apiCausesUnavailable && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total API causes</p>
                  <p className="text-2xl font-semibold">{totalCauses}</p>
                </div>
                <Layers3 className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Unique APIs</p>
                  <p className="text-2xl font-semibold">{uniqueApis}</p>
                </div>
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Live mode causes</p>
                  <p className="text-2xl font-semibold">{liveCauses}</p>
                </div>
                <Globe className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Test mode causes</p>
                  <p className="text-2xl font-semibold">{testCauses}</p>
                </div>
                <FlaskConical className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Satellite className="h-4 w-4" />
                </div>
                <CardTitle>Recent API Causes</CardTitle>
              </div>
              {!apiCausesUnavailable && (
                <Badge variant="secondary">{filteredRows.length} shown</Badge>
              )}
            </div>
            <CardDescription>
              List of recent campaigns created via API keys.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <form className="relative w-full md:w-96" method="GET">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search API, key prefix, mode, or cause..."
                  className="pl-8"
                  defaultValue={search}
                />
              </form>
              {search && (
                <Badge variant="outline" className="w-fit">
                  Filter: {search}
                </Badge>
              )}
            </div>

            {apiCausesUnavailable ? (
              <p className="text-sm text-muted-foreground">
                API cause data is not available yet in this environment.
              </p>
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
                      <TableHead>Key Prefix</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Cause</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((row: any) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary text-[10px] font-semibold">
                              API
                            </span>
                            <span>{row.apiName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.apiPrefix}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {row.apiMode}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[260px] truncate">{row.title}</TableCell>
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
          </CardContent>
        </Card>

        <AdminAnalytics />
      </div>
    </div>
  );
}
