"use client";

import React from "react";
import SidebarItem from "./SidebarItem";
import { Home, FileText, Users, HeartHandshake, LifeBuoy } from "lucide-react";

export default function Sidebar({
  selected,
  onSelect,
  searchQuery
}: {
  selected: string;
  onSelect: (label: string) => void;
  searchQuery: string;
}) {
  const primary = [
    { label: "Overview", icon: Home },
    { label: "Introduction", icon: FileText },
    { label: "For Fundraisers", icon: Users },
  ];

  const secondary = [
    { label: "For Donors", icon: HeartHandshake },
    { label: "Support", icon: LifeBuoy },
  ];

  const allItems = [...primary, ...secondary];

  const filtered =
    searchQuery.trim()
      ? allItems.filter((i) =>
          i.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  return (
    <aside className="hidden md:block w-64 border-r bg-white py-6 px-3 overflow-y-auto">
      {searchQuery.trim() ? (
        <ul className="space-y-2">
          {filtered.map((item) => (
            <SidebarItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : (
        <>
          <ul className="space-y-2">
            {primary.map((item) => (
              <SidebarItem
                key={item.label}
                label={item.label}
                icon={item.icon}
                selected={selected}
                onSelect={onSelect}
              />
            ))}
          </ul>

          <hr className="my-5 border-gray-200" />

          <ul className="space-y-2">
            {secondary.map((item) => (
              <SidebarItem
                key={item.label}
                label={item.label}
                icon={item.icon}
                selected={selected}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}
