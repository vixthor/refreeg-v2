"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { getProfile } from "@/actions/profile-actions";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export function UserNav() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  // Add the useAdmin hook to check for admin/manager access
  const { isAdminOrManager, isLoading: adminLoading } = useAdmin(user?.id);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const profileData = await getProfile(user.id);
          setProfile(profileData);
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (!user) return null;

  const initials = user.email
    ? user.email
        .split("@")[0]
        .split(".")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="pt-1.5">
      <ProfileDropdown
        data={profileData}
        onSignOut={signOut}
        menuItems={menuItems}
      />
    </div>
  );
}
