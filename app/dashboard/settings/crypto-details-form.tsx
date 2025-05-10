"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectWalletButton } from "@/components/crypto-details/ConnectWalletButton";
import { DisconnectWalletButton } from "@/components/crypto-details/DisconnectWalletButton";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface CryptoWallet {
  id: number;
  address: string;
  network: string;
}

export default function CryptoDetailsForm() {
  const [paymentMethods, setPaymentMethods] = useState<CryptoWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchWallets = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("polygon_wallet")
          .eq("id", user.id)
          .single();

        if (profile?.polygon_wallet) {
          const wallets = Object.entries(profile.polygon_wallet).map(
            ([network, address], index) => ({
              id: index,
              address: address as string,
              network,
            })
          );
          setPaymentMethods(wallets);
        } else {
          setPaymentMethods([]);
        }
      } catch (error) {
        console.error("Error fetching wallets:", error);
        toast.error("Failed to load wallets");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallets();
  }, [supabase]);

  const handleWalletConnected = async (
    address: string,
    network: string = "matic-amoy"
  ) => {
    try {
      // Add to local state
      const newWallet: CryptoWallet = {
        id: Date.now(),
        address,
        network,
      };

      setPaymentMethods((prev) => [...prev, newWallet]);
      toast.success("Wallet connected successfully");
    } catch (error) {
      console.error("Error handling wallet connection:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const handleWalletDisconnected = (walletId: number) => {
    setPaymentMethods((prev) =>
      prev.filter((method) => method.id !== walletId)
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crypto Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading wallets...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crypto Wallets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
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
                    <p className="font-medium">
                      {method.network === "matic-amoy"
                        ? "Polygon Amoy"
                        : method.network}
                    </p>
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {method.address}
                    </p>
                  </div>
                </div>
                <DisconnectWalletButton
                  walletAddress={method.address}
                  walletNetwork={method.network}
                  onSuccess={() => handleWalletDisconnected(method.id)}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No wallets connected
            </div>
          )}

          <ConnectWalletButton
            onConnected={handleWalletConnected}
            disabled={paymentMethods.length > 0}
          />
        </div>
      </CardContent>
    </Card>
  );
}
