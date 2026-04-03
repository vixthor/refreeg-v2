import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const ManageCauses = dynamic(() => import("@/components/admin/ManageCause"), {
  loading: () => <Skeleton className="h-[800px] w-full" />,
});

export default function AdminCausesPage() {
  return <ManageCauses />;
}
