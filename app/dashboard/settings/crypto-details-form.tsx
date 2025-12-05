// SolanaWalletForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectSolanaWalletButton } from "@/components/crypto-details/ConnectSolanaWalletButton";
import { DisconnectSolanaWalletButton } from "@/components/crypto-details/DisconnectSolanaWalletButton";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function SolanaWalletForm() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  console.log("walletAddress", walletAddress, "solana_wallet active");

  useEffect(() => {
    let isCancelled = false;

    const fetchWallet = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (isCancelled) return;

        if (!user) {
          setWalletAddress(null);
          setIsLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("solana_wallet")
          .eq("id", user.id)
          .single();

        if (isCancelled) return;

        if (error) {
          console.error("Error fetching profile:", error);
          setWalletAddress(null);
        } else {
          setWalletAddress(profile?.solana_wallet || null);
        }
      } catch (error) {
        if (isCancelled) return;
        console.error("Error fetching wallet:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load wallet",
        });
        setWalletAddress(null);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchWallet();

    return () => {
      isCancelled = true;
    };
  }, [toast]);

  const handleWalletConnected = async (address: string) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ solana_wallet: address })
        .eq("id", user.id);

      if (error) throw error;

      setWalletAddress(address);
      toast({
        title: "Success",
        description: "Solana wallet connected successfully",
      });
    } catch (error) {
      console.error("Error handling wallet connection:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect wallet",
      });
    }
  };

  const handleWalletDisconnected = async () => {
    setWalletAddress(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Solana Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-sm text-muted-foreground">
            Loading wallet...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Solana Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {walletAddress ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="bg-purple-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-purple-600 sm:w-6 sm:h-6"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" x2="9.01" y1="9" y2="9" />
                    <line x1="15" x2="15.01" y1="9" y2="9" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base">Solana</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {walletAddress}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 sm:ml-4">
                <DisconnectSolanaWalletButton
                  walletAddress={walletAddress}
                  onSuccess={handleWalletDisconnected}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No wallet connected
            </div>
          )}

          <ConnectSolanaWalletButton
            onConnected={handleWalletConnected}
            disabled={!!walletAddress}
          />
        </div>
      </CardContent>
    </Card>
  );
}
