"use client";

import { Button } from "@/components/ui/button";
import { X, MapPin, Layers } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface FilterSideNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterSideNav({ isOpen, onClose }: FilterSideNavProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleFilterChange = (key: string, value: string, checked: boolean) => {
    const next = new URLSearchParams(searchParams.toString());
    const currentValues = next.get(key)?.split(",") || [];

    if (checked) {
      if (!currentValues.includes(value)) {
        currentValues.push(value);
      }
    } else {
      const filteredValues = currentValues.filter((v) => v !== value);
      if (filteredValues.length === 0) {
        next.delete(key);
      } else {
        next.set(key, filteredValues.join(","));
      }
      // Update URL without navigation
      const newUrl = `${pathname}?${next.toString()}`;
      window.history.replaceState({}, "", newUrl);
      return;
    }

    next.set(key, currentValues.join(","));
    // Update URL without navigation
    const newUrl = `${pathname}?${next.toString()}`;
    window.history.replaceState({}, "", newUrl);
  };

  const isChecked = (key: string, value: string) => {
    const values = searchParams.get(key)?.split(",") || [];
    return values.includes(value);
  };
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      )}

      {/* Side Navigation */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Accordion Filters */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <Accordion type="single" collapsible>
              {/* Campaign Type */}
              <AccordionItem value="campaign">
                <AccordionTrigger className="flex items-center gap-2 text-base font-medium">
                  <Layers className="h-4 w-4 text-primary" />
                  Cause Type
                </AccordionTrigger>
                <AccordionContent className="mt-2 space-y-2 pl-6">
                  {[
                    "Education",
                    "Healthcare",
                    "Community",
                    "Environment",
                    "Charity",
                  ].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={isChecked("campaignType", type)}
                        onCheckedChange={(checked) =>
                          handleFilterChange(
                            "campaignType",
                            type,
                            checked as boolean
                          )
                        }
                      />
                      <Label htmlFor={type} className="text-sm font-normal">
                        {type}
                      </Label>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {/* Location */}
              <AccordionItem value="location">
                <AccordionTrigger className="flex items-center gap-2 text-base font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location
                </AccordionTrigger>
                <AccordionContent className="mt-2 space-y-2 pl-6">
                  {["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano"].map(
                    (city) => (
                      <div key={city} className="flex items-center space-x-2">
                        <Checkbox
                          id={city}
                          checked={isChecked("location", city)}
                          onCheckedChange={(checked) =>
                            handleFilterChange(
                              "location",
                              city,
                              checked as boolean
                            )
                          }
                        />
                        <Label htmlFor={city} className="text-sm font-normal">
                          {city}
                        </Label>
                      </div>
                    )
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Footer */}
          <div className="p-6 border-t space-y-3">
            <Button onClick={onClose} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
