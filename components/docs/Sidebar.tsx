"use client";

import React from "react";
import SidebarItem from "./SidebarItem";
import { Home, FileText, Users, HeartHandshake, LifeBuoy } from "lucide-react";

export default function Sidebar({
  selected,
  onSelect,
  searchQuery,
}: {
  selected: string;
  onSelect: (label: string) => void;
  searchQuery: string;
}) {
  const items = [
    { label: "Overview", icon: Home },
    { label: "Introduction", icon: FileText },
    { label: "For Fundraisers", icon: Users },
    { label: "For Donors", icon: HeartHandshake },
    { label: "Support", icon: LifeBuoy },
  ];

  // Filter items based on search query
  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="hidden md:block w-64 flex-shrink-0">
      <nav className="sticky top-4">
        <ul className="space-y-1">
          {filteredItems.map((item) => (
            <SidebarItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
