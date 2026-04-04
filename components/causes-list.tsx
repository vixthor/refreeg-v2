import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PaginationButton } from "@/components/pagination-button";
import { listCauses } from "@/actions/cause-actions";
import {
  GraduationCap,
  HeartPulse,
  Leaf,
  Users,
  AlertTriangle,
  PawPrint,
  Sparkles,
  Briefcase,
} from "lucide-react";
import { ExpandableCard } from "./ExpandableCard";


interface CausesListProps {
  category: string;
  page: number;
  pageSize: number;
  userId?: string | null;   // ✅ ADD THIS
  action?: string | null;   // ✅ ADD THIS
}

export async function CausesList({
  category,
  page,
  pageSize,
  userId,
  action,
}: CausesListProps) {
  const categoriesWithIcons = [
    {
      id: "education",
      name: "Education",
      icon: <GraduationCap className="mr-1 h-4 w-4" />,
    },
    {
      id: "health",
      name: "Healthcare",
      icon: <HeartPulse className="mr-1 h-4 w-4" />,
    },
    {
      id: "environment",
      name: "Environment",
      icon: <Leaf className="mr-1 h-4 w-4" />,
    },
    {
      id: "community",
      name: "Community",
      icon: <Users className="mr-1 h-4 w-4" />,
    },
    {
      id: "disaster",
      name: "Disaster Relief",
      icon: <AlertTriangle className="mr-1 h-4 w-4" />,
    },
    {
      id: "animals",
      name: "Animal Welfare",
      icon: <PawPrint className="mr-1 h-4 w-4" />,
    },
    {
      id: "creative",
      name: "Creative",
      icon: <Sparkles className="mr-1 h-4 w-4" />,
    },
    {
      id: "business",
      name: "Business",
      icon: <Briefcase className="mr-1 h-4 w-4" />,
    },
  ];

  const causes = await listCauses({
    category: category === "all" ? undefined : category,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  const filteredCauses = causes.filter((cause) => {
    const matchesCategory =
      category === "all" || cause.category === category;

    const matchesUser = userId
      ? cause.user_id === userId
      : true;

    return matchesCategory && matchesUser;
  });

  const paginatedCauses = filteredCauses;
  const totalCauses = filteredCauses.length;
  const totalPages = Math.max(1, page);

  if (paginatedCauses.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">
          {userId ? "No causes yet" : "No causes found"}
        </h3>
        <p className="text-muted-foreground">
          {userId
            ? "This user hasn’t created any causes yet."
            : "Try selecting a different category or check back later."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ExpandableCard
        items={paginatedCauses.map((cause) => ({
          ...cause,
          description: cause.description || "",
          raised: cause.raised,
          signatures: undefined,
          action: action, // ✅ correct
        }))}
        type="cause"
      />

      {totalPages > 1 && (
        <div className="flex justify-center pt-6">
          <PaginationButton currentPage={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
