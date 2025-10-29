// SolanaWalletForm.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectSolanaWalletButton } from "@/components/crypto-details/ConnectSolanaWalletButton";
import { DisconnectSolanaWalletButton } from "@/components/crypto-details/DisconnectSolanaWalletButton";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function SolanaWalletForm() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  console.log("walletAddress", walletAddress, "solana_wallet active");

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchWallet = useCallback(async () => {
    if (!isMounted) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

      if (error) {
        console.error("Error fetching profile:", error);
        setWalletAddress(null);
      } else if (profile?.solana_wallet) {
        setWalletAddress(profile.solana_wallet);
      } else {
        setWalletAddress(null);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load wallet",
      });
      setWalletAddress(null);
    } finally {
      setIsLoading(false);
    }
  }, [isMounted, toast]);

  useEffect(() => {
    if (isMounted) {
      fetchWallet();
    }
  }, [isMounted, fetchWallet]);

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
    // Don't show toast here - let the DisconnectButton handle it
  };

  // Don't render anything until mounted (prevents hydration issues)
  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solana Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solana Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading wallet...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solana Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {walletAddress ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-purple-600"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" x2="9.01" y1="9" y2="9" />
                    <line x1="15" x2="15.01" y1="9" y2="9" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Solana</p>
                  <p className="text-sm text-muted-foreground truncate max-w-md">
                    {walletAddress}
                  </p>
                </div>
              </div>
              <DisconnectSolanaWalletButton
                walletAddress={walletAddress}
                onSuccess={handleWalletDisconnected}
              />
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
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
