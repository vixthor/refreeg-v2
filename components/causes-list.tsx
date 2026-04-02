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
}

export async function CausesList({
  category,
  page,
  pageSize,
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
  const filteredCauses =
    category === "all"
      ? causes
      : causes.filter((cause) => cause.category === category);

  const paginatedCauses = filteredCauses.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const totalCauses = filteredCauses.length;
  const totalPages = Math.ceil(totalCauses / pageSize);

  if (paginatedCauses.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No causes found</h3>
        <p className="text-muted-foreground">
          Try selecting a different category or check back later.
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
