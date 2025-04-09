import { Suspense } from "react"
import { CausesList } from "@/components/causes-list"
import { CausesFilter } from "@/components/causes-filter"
import { Skeleton } from "@/components/ui/skeleton"

// Mock categories for filtering
const categories = [
  { id: "all", name: "All Causes" },
  { id: "education", name: "Education" },
  { id: "health", name: "Healthcare" },
  { id: "environment", name: "Environment" },
  { id: "community", name: "Community" },
  { id: "disaster", name: "Disaster Relief" },
  { id: "animals", name: "Animal Welfare" },
]

export default async function CausesPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string }
}) {
  const params = await searchParams
  const category = params.category || "all"
  const page = Number.parseInt(params.page || "1")
  const pageSize = 9

  return (
    <div className="container py-10">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Explore Causes</h1>
          <p className="text-muted-foreground">Discover and support causes that are making a difference.</p>
        </div>

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
  )
}

