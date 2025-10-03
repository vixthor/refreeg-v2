"use client";

import { useEffect, useMemo } from "react";
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

type AudienceValue = "business" | "people" | "creator" | "all";

interface CausesFilterRowProps {
  className?: string;
}

export default function CausesFilterRow({ className }: CausesFilterRowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const audience = (searchParams.get("audience") || "all") as AudienceValue;
  const search = searchParams.get("search") || "";
  const recommended = searchParams.get("recommended") || "recommended";

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

  // Ensure default for recommended exists for consistent UI
  useEffect(() => {
    if (!searchParams.get("recommended")) {
      const next = new URLSearchParams(params.toString());
      next.set("recommended", "recommended");
      pushParams(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className}>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Filter button + search */}
        <div className="flex w-full items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="whitespace-nowrap rounded-full p-4"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filter
          </Button>

          {/* Full-width search bar */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              defaultValue={search}
              placeholder="Search RefreeG"
              className="pl-8 pr-40 w-full rounded-full"
              onChange={(e) => handleSearchChange(e.target.value)}
            />

            {/* Tabs inside input (on the right) */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <Tabs
                value={audience}
                onValueChange={(v) => handleAudienceChange(v as AudienceValue)}
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
        </div>

        {/* Right: Recommended select */}
        <div className="flex items-center gap-2">
          <Select value={recommended} onValueChange={handleRecommendedChange}>
            <SelectTrigger className="w-[160px]">
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
  );
}
