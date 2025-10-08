"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { getProfile } from "@/actions/profile-actions";
import ProfileDropdown from "@/components/profile-dropdown";
import { Settings, CreditCard, FileText, LogOut, User } from "lucide-react";

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

  // Transform user data to match ProfileDropdown interface
  const profileData = {
    name: profile?.full_name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    avatar: profile?.profile_photo || user.user_metadata?.avatar_url || "",
    subscription: isAdminOrManager ? "ADMIN" : undefined,
  };

  // Custom menu items that include admin functionality
  const menuItems = [
    {
      label: "Profile",
      href: "/dashboard",
      icon: <User className="w-4 h-4" />,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  // Add admin items if user is admin/manager
  if (isAdminOrManager) {
    menuItems.push({
      label: "Admin Panel",
      href: "/dashboard/admin",
      icon: <FileText className="w-4 h-4" />,
    });
  }

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
