"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
}

interface CausesFilterProps {
  selectedCategory: string;
}

const categories: Category[] = [
  { id: "education", name: "Education" },
  { id: "health", name: "Healthcare" },
  { id: "community", name: "Community" },
  { id: "disaster", name: "Disaster Relief" },
  { id: "creative", name: "Creative" },
  { id: "business", name: "Business" },
];

const categoryImages: Record<string, string> = {
  education: "/cause-filter-5.png",
  health: "/cause-filter-6.png",
  community: "/cause-filter-4.png",
  disaster: "/cause-filter-3.png",
  creative: "/cause-filter-2.png",
  business: "/cause-filter-1.png",
  all: "/logo.png",
};

export function CausesFilter({ selectedCategory }: CausesFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams();
    if (categoryId !== "all") {
      params.set("category", categoryId);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mx-[-30px]">
      {/* Scrollable container */}
      <ScrollArea className="pb-4 w-full">
        <div className="flex justify-evenly gap-4 py-4 overflow-x-auto scrollbar-hide whitespace-nowrap ">
          {categories.map((category) => (
            <div
              key={category.id}
              className="hover:scale-105 transition-transform duration-200 flex-shrink-0"
            >
              <Button
                variant={selectedCategory === category.id ? "link" : "link"}
                onClick={() => handleCategoryChange(category.id)}
                className="flex flex-col items-center gap-2 h-auto w-[130px] p-4 flex-shrink-0"
              >
                <div
                  className={`transition-transform duration-200 ${
                    selectedCategory === category.id ? "scale-110" : "scale-100"
                  }`}
                >
                  <Image
                    src={categoryImages[category.id] || categoryImages.all}
                    alt={category.name}
                    width={120}
                    height={120}
                  />
                </div>
              </Button>
            </div>
          ))}
        </div>

        {/* Optional custom scrollbar */}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
