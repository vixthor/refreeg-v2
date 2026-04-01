import { Suspense } from "react";
import { CausesList } from "@/components/causes-list";
import { CausesFilter } from "@/components/causes-filter";
import { Skeleton } from "@/components/ui/skeleton";
import AdBanner from "@/components/AdBanner";
import CausesFilterRow from "@/components/causes-filter-row";
import { H1 } from "@/components/typograpy";
import { H5 } from "@/components/typograpy";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Causes",
  description:
    "Browse and discover fundraising causes that make a real difference in the world.",
};

export default async function CausesPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string; filter?: string };
}) {
  const params = await searchParams;
  const category = params.category || "all";
  const page = Number.parseInt(params.page || "1");
  const pageSize = 9;
  const isFilterOpen = params.filter === "true";

  return (
    <div className="relative">
      <div
        className={`transition-all duration-300 ease-in-out ${
          isFilterOpen ? "ml-80" : "ml-0"
        }`}
      >
        <div className="p-4 md:p-10">
          <div className="space-y-6">
            <div className="space-y-2 text-center md:pt-10">
              <div>
                <H1 className=" font-bold tracking-tight">
                  Discover Causes That Matter
                </H1>
              </div>
              <div>
                <H5 className="text-muted-foreground md:max-w-2xl mx-auto">
                  From disaster relief to creative dreams, explore causes
                  powered by real people, verified for transparency, and built
                  for impact.
                </H5>
              </div>
            </div>

            <div>
              <CausesFilterRow className="mt-4" />
            </div>

            <div>
              <CausesFilter selectedCategory={category} />
            </div>

            <div>
              <Suspense
                fallback={
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array(pageSize)
                      .fill(null)
                      .map((_, i) => (
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
