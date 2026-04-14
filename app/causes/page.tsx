import { Suspense } from "react";
import { CausesList } from "@/components/causes-list";
import { CausesFilter } from "@/components/causes-filter";
import { Skeleton } from "@/components/ui/skeleton";
import CausesFilterRow from "@/components/causes-filter-row";
import { H1, H5 } from "@/components/typograpy";

import { Metadata } from "next";
import { getProfile } from "@/actions/profile-actions";

export const metadata: Metadata = {
  title: "Explore Causes",
  description:
    "Browse and discover fundraising causes that make a real difference in the world.",
};

export default async function CausesPage({
  searchParams,
}: {
  searchParams: {
    category?: string;
    page?: string;
    filter?: string;
    userId?: string;
    action?: string;
    search?: string;
    recommended?: string;
  };
}) {
  const params = await searchParams;
  const category = params.category || "all";
  const page = Number.parseInt(params.page || "1");
  const pageSize = 8;
  const isFilterOpen = params.filter === "true";

  const userId = params.userId || null;
  const action = params.action || null;
  const search = params.search || "";
  const sortBy = (params.recommended || "recommended") as
    | "recommended"
    | "latest"
    | "most-funded"
    | "ending-soon";

  let username: string | null = null;

  if (userId) {
    const userProfile = await getProfile(userId);
    username = userProfile?.full_name || userProfile?.username || null;
  }

  return (
    <div className="relative">
      <div
        className={`transition-all duration-300 ease-in-out ${
          isFilterOpen ? "ml-80" : "ml-0"
        }`}
      >
        <div className="p-4 md:p-10">
          <div className="space-y-6">

            {/* Header */}
            <div className="space-y-2 text-center md:pt-10">
              <H1 className="font-bold tracking-tight text-secondary">
                {username
                  ? `Support ${username}'s Causes`
                  : "Discover Causes That Matter"}
              </H1>

              <H5 className="text-muted-foreground md:max-w-2xl mx-auto">
                {username
                  ? `Browse and support causes created by ${username}.`
                  : "From disaster relief to creative dreams, explore causes powered by real people, verified for transparency, and built for impact."}
              </H5>
            </div>

            {/* Filters (optional: hide on user-specific view) */}
            {!userId && (
              <>
                <div>
                  <CausesFilterRow className="mt-4" />
                </div>
                <div>
                  <CausesFilter selectedCategory={category} />
                </div>
              </>
            )}

            {/* Causes List */}
            <div>
              <Suspense
                key={`${category}-${page}-${search}-${sortBy}`}
                fallback={
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array(pageSize).fill(null).map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                }
              >
                <CausesList
                  category={category}
                  page={page}
                  pageSize={pageSize}
                  userId={userId}
                  action={action}
                  search={search}
                  sortBy={sortBy}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed top-0 right-0 w-96 h-[1886px] origin-top-left -rotate-90 bg-[radial-gradient(ellipse_323.09%_608.83%_at_48.81%_50.00%,_rgba(255,_255,_255,_0.70)_0%,_white_100%)] rounded-full blur-lg pointer-events-none z-30" />
      )}
    </div>
  );
}