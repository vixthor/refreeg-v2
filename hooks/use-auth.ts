"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  sendLoginNotificationEmail,
  sendWelcomeEmailToUser,
} from "@/services/mail";
import { subscribeToConvertKit } from "@/services/convertkit";

import { useAuthContext } from "@/components/auth-provider";

/**
 * Derive a human-readable device label from the browser's User-Agent.
 * Kept client-side because the UA is only available in the browser context.
 */
function getDeviceLabel(): string {
  if (typeof window === "undefined") return "Unknown Device";
  const ua = window.navigator.userAgent;
  if (/android/i.test(ua)) return "Android";
  if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
}

export function useAuth() {
  const { user, isLoading, supabase } = useAuthContext();
  const router = useRouter();

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Fire-and-forget login notification email.
      // IP is resolved server-side via x-forwarded-for (no more api.ipify.org).
      // Device label comes from the browser's User-Agent.
      sendLoginNotificationEmail({
        loginTime: new Date().toLocaleString(),
        device: getDeviceLabel(),
      }).catch((e) => console.error("Login notification email error:", e));

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      // Navigate to dashboard — the dashboard layout handles the
      // onboarding redirect if the user hasn't completed it yet.
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    accountType?: "individual" | "organization" | null,
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            account_type: accountType,
          },
        },
      });

      if (error) {
        toast({
          title: "Error signing up",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Initialize wallet (bonus handled separately)
      if (data?.user?.id) {
        try {
          const { initializeUserWallet } = await import("@/actions/auth-actions");
          await initializeUserWallet(data.user.id, 0);
        } catch (walletError) {
          console.error("Error initializing user wallet:", walletError);
          // Don't fail signup if wallet initialization fails
        }
      }

      // Track first login for daily reward
      if (data?.user?.id) {
        try {
          const { trackLogin, recordSignupReward } = await import("@/actions/auth-actions");
          await trackLogin(data.user.id);
          await recordSignupReward(data.user.id, 1);
          toast({
            title: "Rewards credited",
            description: "Signup bonus (1 EIZA) and daily login bonus (0.5 EIZA) have been added.",
          });
        } catch (loginError) {
          console.error("Error tracking signup login:", loginError);
          // Don't fail signup if login tracking fails
        }
      }

      try {
        const profileSetupUrl = `${window.location.origin}/dashboard/settings`;
        await sendWelcomeEmailToUser(email, fullName, profileSetupUrl);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
      }

      try {
        const firstName = fullName.split(" ")[0];

        await subscribeToConvertKit({
          email,
          first_name: firstName,
          fields: {
            account_type: accountType || "not_selected",
            signup_date: new Date().toISOString(),
          },
        });
      } catch (convertkitError) {
        console.error("Error subscribing to ConvertKit:", convertkitError);
      }

      toast({
        title: "Account created successfully",
        description:
          "Welcome! Let's set up your profile. Check your email for a welcome message.",
      });

      router.push("/onboarding");

      return { data, error };
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: "Error signing in with Google",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    } catch (error: any) {
      toast({
        title: "Error signing in with Google",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace("/");
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description:
          error?.message || "There was an error signing out. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        toast({
          title: "Error sending reset email",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      throw error;
    }
  };

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
  };
}
