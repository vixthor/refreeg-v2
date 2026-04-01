"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface EventPayload {
  type: "comment" | "share" | "donation" | "login" | "weekly_streak" | "monthly_active";
  data: Record<string, any>;
  timestamp: string;
}

type EventCallback = (payload: EventPayload) => void;

interface ListenerOptions {
  userId?: string;
  onComment?: EventCallback;
  onShare?: EventCallback;
  onDonation?: EventCallback;
  onLogin?: EventCallback;
  onWeeklyStreak?: EventCallback;
  onMonthlyActive?: EventCallback;
}

export function useEventListeners(options: ListenerOptions) {
  const subscriptionsRef = useRef<Array<{ unsubscribe: () => void }>>([]);
  const supabaseRef = useRef(createClient());

  const setupListeners = useCallback(() => {
    const supabase = supabaseRef.current;

    // Listen for comments
    if (options.onComment) {
      const commentSubscription = supabase
        .channel("comments_channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "comments",
            ...(options.userId && { filter: `user_id=eq.${options.userId}` }),
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            options.onComment?.({
              type: "comment",
              data: payload.new,
              timestamp: new Date().toISOString(),
            });
          }
        )
        .subscribe();

      subscriptionsRef.current.push({
        unsubscribe: () => {
          supabase.removeChannel(commentSubscription);
        },
      });
    }

    // Listen for shares
    if (options.onShare) {
      const shareSubscription = supabase
        .channel("shares_channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "cause_shares",
            ...(options.userId && { filter: `user_id=eq.${options.userId}` }),
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            options.onShare?.({
              type: "share",
              data: payload.new,
              timestamp: new Date().toISOString(),
            });
          }
        )
        .subscribe();

      subscriptionsRef.current.push({
        unsubscribe: () => {
          supabase.removeChannel(shareSubscription);
        },
      });
    }

    // Listen for donations
    if (options.onDonation) {
      const donationSubscription = supabase
        .channel("donations_channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "donations",
            ...(options.userId && { filter: `user_id=eq.${options.userId}` }),
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            options.onDonation?.({
              type: "donation",
              data: payload.new,
              timestamp: new Date().toISOString(),
            });
          }
        )
        .subscribe();

      subscriptionsRef.current.push({
        unsubscribe: () => {
          supabase.removeChannel(donationSubscription);
        },
      });
    }

    // Listen for login events via auth session changes
    if (options.onLogin) {
      const authSubscription = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === "SIGNED_IN" && session?.user) {
            options.onLogin?.({
              type: "login",
              data: {
                user_id: session.user.id,
                email: session.user.email,
                provider: session.user.app_metadata?.provider,
              },
              timestamp: new Date().toISOString(),
            });
          }
        }
      );

      subscriptionsRef.current.push({
        unsubscribe: () => {
          authSubscription?.data?.subscription?.unsubscribe();
        },
      });
    }

    // Listen for weekly streak updates
    if (options.onWeeklyStreak) {
      const streakSubscription = supabase
        .channel("weekly_streak_channel")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "user_streaks",
            ...(options.userId && { filter: `user_id=eq.${options.userId}` }),
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            if (payload.new.weekly_streak) {
              options.onWeeklyStreak?.({
                type: "weekly_streak",
                data: payload.new,
                timestamp: new Date().toISOString(),
              });
            }
          }
        )
        .subscribe();

      subscriptionsRef.current.push({
        unsubscribe: () => {
          supabase.removeChannel(streakSubscription);
        },
      });
    }

    // Listen for monthly active updates
    if (options.onMonthlyActive) {
      const monthlySubscription = supabase
        .channel("monthly_active_channel")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "user_streaks",
            ...(options.userId && { filter: `user_id=eq.${options.userId}` }),
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            if (payload.new.is_monthly_active) {
              options.onMonthlyActive?.({
                type: "monthly_active",
                data: payload.new,
                timestamp: new Date().toISOString(),
              });
            }
          }
        )
        .subscribe();

      subscriptionsRef.current.push({
        unsubscribe: () => {
          supabase.removeChannel(monthlySubscription);
        },
      });
    }
  }, [options]);

  useEffect(() => {
    setupListeners();

    return () => {
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [setupListeners]);
}
