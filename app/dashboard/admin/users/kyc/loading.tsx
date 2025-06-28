import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-xl mx-auto mt-8">
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
} 