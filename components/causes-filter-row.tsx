"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { FilterSideNav } from "@/components/filter-side-nav";

type AudienceValue = "business" | "people" | "creator" | "all";

interface CausesFilterRowProps {
  className?: string;
  isFilterOpen?: boolean;
}

export default function CausesFilterRow({
  className,
  isFilterOpen: propIsFilterOpen,
}: CausesFilterRowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const audience = (searchParams.get("audience") || "all") as AudienceValue;
  const search = searchParams.get("search") || "";
  const recommended = searchParams.get("recommended") || "recommended";

  useEffect(() => {
    setIsFilterOpen(searchParams.get("filter") === "true");
  }, [searchParams]);

  const handleFilterToggle = (open: boolean) => {
    setIsFilterOpen(open);
    const next = new URLSearchParams(searchParams.toString());
    if (open) next.set("filter", "true");
    else next.delete("filter");
    const newUrl = `${pathname}?${next.toString()}`;
    window.history.replaceState({}, "", newUrl);
  };

  const params = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  const pushParams = (next: URLSearchParams) => {
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleSearchChange = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("search", value);
    else next.delete("search");
    pushParams(next);
  };

  const handleAudienceChange = (value: AudienceValue) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set("audience", value);
    else next.delete("audience");
    pushParams(next);
  };

  const handleRecommendedChange = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("recommended", value);
    else next.delete("recommended");
    pushParams(next);
  };

  useEffect(() => {
    if (!searchParams.get("recommended")) {
      const next = new URLSearchParams(params.toString());
      next.set("recommended", "recommended");
      pushParams(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={className}>
        <div className="flex w-full flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left: Filter + Search */}
          <div className="flex flex-col sm:flex-row w-full gap-2">
            {/* Filter button */}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full p-4 w-full sm:w-auto"
              onClick={() => handleFilterToggle(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
            </Button>

            {/* Search input */}
            <div className="relative flex-1 w-full">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                defaultValue={search}
                placeholder="Search Causes"
                className="pl-8 pr-4 w-full rounded-full"
                onChange={(e) => handleSearchChange(e.target.value)}
              />

              {/* Tabs — shown inside searchbar on md+ only */}
              <div className="hidden md:block absolute right-1 top-1/2 -translate-y-1/2">
                <Tabs
                  value={audience}
                  onValueChange={(v) =>
                    handleAudienceChange(v as AudienceValue)
                  }
                >
                  <TabsList className="h-7 rounded-md bg-muted shadow-sm">
                    <TabsTrigger value="all" className="px-2 text-xs">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="people" className="px-2 text-xs">
                      People
                    </TabsTrigger>
                    <TabsTrigger value="creator" className="px-2 text-xs">
                      Creator
                    </TabsTrigger>
                    <TabsTrigger value="business" className="px-2 text-xs">
                      Business
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Tabs standalone for mobile */}
            <div className="block md:hidden w-full">
              <Tabs
                value={audience}
                onValueChange={(v) => handleAudienceChange(v as AudienceValue)}
                className="w-full mt-1"
              >
                <TabsList className="w-full flex justify-between rounded-md bg-muted shadow-sm">
                  <TabsTrigger value="all" className="flex-1 text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="people" className="flex-1 text-xs">
                    People
                  </TabsTrigger>
                  <TabsTrigger value="creator" className="flex-1 text-xs">
                    Creator
                  </TabsTrigger>
                  <TabsTrigger value="business" className="flex-1 text-xs">
                    Business
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Right: Recommended select */}
          <div className="w-full sm:w-auto">
            <Select value={recommended} onValueChange={handleRecommendedChange}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Recommended" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="most-funded">Most funded</SelectItem>
                <SelectItem value="ending-soon">Ending soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Filter Side Navigation */}
      <FilterSideNav
        isOpen={isFilterOpen}
        onClose={() => handleFilterToggle(false)}
      />
    </>
  );
}
