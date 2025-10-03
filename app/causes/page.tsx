import { Suspense } from "react";
import { CausesList } from "@/components/causes-list";
import { CausesFilter } from "@/components/causes-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { categories } from "@/lib/categories";
import AdBanner from "@/components/AdBanner";
import CausesFilterRow from "@/components/causes-filter-row";
import { H1 } from "@/components/typograpy";
import { H5 } from "@/components/typograpy";
// Mock categories for filtering

export default async function CausesPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const params = await searchParams;
  const category = params.category || "all";
  const page = Number.parseInt(params.page || "1");
  const pageSize = 9;

  return (
    <div className="p-10">
      <div className="space-y-6">
        <div className="space-y-2 text-center max-w-2xl mx-auto pt-10">
          <H1 className="text-5xl font-bold tracking-tight">
            Discover Causes That Matter
          </H1>
          <H5 className="text-muted-foreground">
            From disaster relief to creative dreams, explore causes powered by
            real people, verified for transparency, and built for impact.
          </H5>
        </div>

        <CausesFilterRow className="mt-4" />

        <CausesFilter categories={categories} selectedCategory={category} />

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
          <CausesList category={category} page={page} pageSize={pageSize} />
        </Suspense>
      </div>
    </div>
  );
}
