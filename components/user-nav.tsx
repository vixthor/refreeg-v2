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
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    <div className=" pt-1.5">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full border-[#150aec] border"
            aria-label="User menu"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={profile?.profile_photo || user.user_metadata?.avatar_url}
                alt={user.email || ""}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile?.full_name || user.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* Mobile-only dashboard link inside menu */}
          <div className="">
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </div>

          <DropdownMenuItem
            onClick={async () => {
              setIsSigningOut(true);
              await signOut();
              setIsSigningOut(false);
            }}
            disabled={isSigningOut}
            className="hover:bg-[red] focus:bg-[red] transition-colors disabled:opacity-50"
          >
            {isSigningOut ? "Signing out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
