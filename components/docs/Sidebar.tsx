"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

type SidebarItemProps = {
  label: string;
  selected: string;
  onSelect: (label: string) => void;
  icon?: LucideIcon;
};

export default function SidebarItem({
  label,
  selected,
  onSelect,
  icon: Icon,
}: SidebarItemProps) {
  const active = selected === label;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(label)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[15px] transition-all
          ${
            active
              ? "bg-[#0A2A5C] text-white font-semibold"
              : "text-gray-800 hover:bg-slate-100"
          }
        `}
      >
        {Icon && (
          <Icon
            size={18}
            className={active ? "text-white" : "text-gray-600"}
          />
        )}
        <span>{label}</span>
      </button>
    </li>
  );
}
a