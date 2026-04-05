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
import { DonationTrends } from "@/components/charts/donation-trends";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRight,
  CircleDollarSign,
  HeartHandshake,
  Search,
  Satellite,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { getCachedUser } from "@/lib/supabase/cached-user";
import { ApiCausesFilter } from "@/components/dashboard/ApiCausesFilter";
import { redirect } from "next/navigation";
import {
  getDashboardStats,
  getDonationTrends,
  getPetitionDashboardStats,
  getUserCausesWithStats,
  getUserPetitionsWithStats,
} from "@/actions/dashboard-actions";
import { getProfile } from "@/actions/profile-actions";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Manage your causes, petitions, and track your social impact on RefreeG.",
};

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  mode: "live" | "test";
};

const formatNaira = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; mode?: string }>;
}) {
  const params = ((await searchParams) || {}) as {
    search?: string;
    mode?: string;
  };
  const search = params.search?.trim() || "";
  const modeFilter = params.mode || "all";

  const [
    authResult,
    stats,
    petitionStats,
    donationTrends,
    userCauses,
    userPetitions,
    apiCampaignsResult,
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
      return user ? getDonationTrends(user.id) : [];
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
        return {
          error: err instanceof Error ? err.message : "Unexpected error",
        };
      }
    })(),
  ]);

  const { user, error: authError } = authResult;

  if (!user || authError) {
    redirect("/auth/signin");
  }

  const profile = await getProfile(user.id);

  const apiCauses =
    "apiCauses" in apiCampaignsResult ? (apiCampaignsResult as any).apiCauses : [];
  const apiKeys =
    "apiKeys" in apiCampaignsResult ? (apiCampaignsResult as any).apiKeys : [];
  const apiCausesUnavailable = "error" in apiCampaignsResult;
  const apiCausesError =
    "error" in apiCampaignsResult ? (apiCampaignsResult as any).error : "";

  const keyMap = new Map(apiKeys.map((key: any) => [key.id, key]));

  const apiCauseRows = apiCauses.map((cause: any) => {
    const key = cause.api_key_id
      ? (keyMap.get(cause.api_key_id) as ApiKeyRow | undefined)
      : null;

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

  const firstName =
    profile?.full_name?.split(" ")?.[0] ||
    user.user_metadata?.full_name?.split(" ")?.[0] ||
    user.email?.split("@")?.[0] ||
    "there";
  const avatarUrl =
    profile?.profile_photo ||
    (user.user_metadata?.avatar_url as string | undefined);
  const initials =
    firstName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join("") || "U";
  const totalRaised = Number(stats?.totalRaised ?? 0);
  const totalDonors = Number(stats?.totalDonors ?? 0);
  const activeCauses = Number(stats?.activeCauses ?? 0);
  const totalSigners = Number(petitionStats?.totalDonors ?? 0);
  const activePetitions = Number(petitionStats?.activePetitions ?? 0);
  const donationTrendData = donationTrends.map((item) => ({
    date: item.month,
    amount: Number(item.amount ?? 0),
  }));

  return (
    <div className="space-y-4 px-2 py-2 sm:space-y-6 sm:px-4 sm:py-4 lg:px-6">
      <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_22%),linear-gradient(135deg,#ffffff_0%,#eff6ff_45%,#f8fafc_100%)] px-4 pb-5 pt-4 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.55)] sm:rounded-[32px] sm:px-8 sm:pb-8 sm:pt-5">
        <div className="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)] xl:items-end">
          <div>
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700 sm:text-[11px] sm:tracking-[0.22em]">
              <Sparkles className="h-3.5 w-3.5" />
              Dashboard overview
            </div>
            <div className="mt-4 flex items-center gap-3 sm:mt-5 sm:gap-5">
              <Avatar className="h-20 w-20 rounded-[26px] border-4 border-white/95 bg-blue-50 shadow-[0_24px_50px_-28px_rgba(37,99,235,0.65)] sm:h-28 sm:w-28 sm:rounded-[32px] sm:border-[5px]">
                <AvatarImage
                  src={avatarUrl}
                  alt={user.email || firstName}
                  className="object-cover object-center"
                />
                <AvatarFallback className="rounded-[28px] bg-blue-600 text-2xl font-semibold text-white sm:text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="text-[2rem] font-semibold leading-[0.95] tracking-tight text-slate-950 sm:text-4xl">
                  Welcome back, {firstName}.
                </h1>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              Monitor donations, keep campaigns moving, and stay on top of your
              petitions and API activity from one cleaner workspace.
            </p>

            <div className="mt-5 grid gap-2 sm:mt-6 sm:flex sm:flex-wrap sm:gap-3">
              <Link href="/dashboard/causes/create" className="w-full sm:w-auto">
                <Badge className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white">
                  Create cause
                </Badge>
              </Link>
              <Link href="/dashboard/petitions/create" className="w-full sm:w-auto">
                <Badge
                  variant="secondary"
                  className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  Launch petition
                </Badge>
              </Link>
              <Link href="/dashboard/settings" className="w-full sm:w-auto">
                <Badge
                  variant="secondary"
                  className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  Open settings
                </Badge>
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[20px] border border-white/80 bg-white/88 p-3.5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.5)] sm:rounded-[24px] sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Donation volume
                </p>
                <CircleDollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {formatNaira(totalRaised)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                From {totalDonors} unique donors.
              </p>
            </div>
            <div className="rounded-[20px] border border-white/80 bg-white/88 p-3.5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.5)] sm:rounded-[24px] sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Live campaigns
                </p>
                <HeartHandshake className="h-4 w-4 text-blue-600" />
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {activeCauses + activePetitions}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {activeCauses} causes and {activePetitions} petitions currently
                active.
              </p>
            </div>
            <div className="rounded-[20px] border border-white/80 bg-white/88 p-3.5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.5)] sm:rounded-[24px] sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Community reach
                </p>
                <ArrowRight className="h-4 w-4 text-blue-600" />
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {(totalDonors + totalSigners).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Combined donors and petition signers reached.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-[24px] border border-slate-200/80 bg-white p-2 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.45)] sm:rounded-[28px] sm:p-4">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Workspace
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              Manage everything in one place
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
            <Search className="h-3.5 w-3.5" />
            Analytics includes API-created causes
          </div>
        </div>

        <Tabs
          defaultValue={search ? "analytics" : "overview"}
          className="mt-4 space-y-5"
        >
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-slate-100 p-1 sm:max-w-md">
            <TabsTrigger
              value="overview"
              className="rounded-xl py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-xl py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5">
            <DashboardStats
              userId={user.id}
              type="all"
              initialStats={stats}
              initialPetitionStats={petitionStats}
            />
            <DashboardCauses initialCauses={userCauses} />
            <DashboardPetitions initialPetitions={userPetitions} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-5">
            <Card className="rounded-[28px] border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] shadow-[0_20px_50px_-38px_rgba(15,23,42,0.45)]">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Satellite className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-slate-950">
                          API Causes
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-600">
                          Separate table of APIs and causes created with them.
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  {!apiCausesUnavailable && (
                    <Badge
                      variant="secondary"
                      className="w-fit rounded-full bg-blue-50 px-3 py-1 text-blue-700"
                    >
                      {filteredRows.length} shown
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-[24px] border border-slate-100 bg-white p-4">
                  <ApiCausesFilter search={search} modeFilter={modeFilter} />
                </div>

                {apiCausesUnavailable ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 p-6">
                    <p className="text-sm text-slate-600">
                      API cause data is not available yet.
                    </p>
                    {apiCausesError ? (
                      <p className="mt-2 text-xs text-slate-500">
                        {apiCausesError}
                      </p>
                    ) : null}
                  </div>
                ) : filteredRows.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 p-6">
                    <p className="text-sm text-slate-600">
                      No API causes found{search ? ` for "${search}"` : ""}.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
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
                          <TableRow key={row.id} className="hover:bg-slate-50/70">
                            <TableCell className="font-medium text-slate-950">
                              {row.apiName}
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {row.developerId}
                            </TableCell>
                            <TableCell>
                              {row.apiMode === "test" ? (
                                <Badge
                                  variant="outline"
                                  className="border-amber-200 bg-amber-50 font-semibold capitalize text-amber-700"
                                >
                                  Test
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-200 bg-emerald-50 font-semibold capitalize text-emerald-700"
                                >
                                  Live
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[260px] truncate text-slate-700">
                              {row.title}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="capitalize text-slate-600"
                              >
                                {row.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {new Date(row.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  </div>
                )}

                {apiCausesUnavailable && (
                  <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
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
                            className="py-8 text-center text-sm text-slate-500"
                          >
                            API causes will appear here once data access is
                            available.
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <DonationTrends data={donationTrendData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
