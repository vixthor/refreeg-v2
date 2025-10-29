// app/dashboard/crypto/page.tsx
"use client";

import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SolanaWalletForm from "../settings/crypto-details-form";

function WalletFormLoader() {
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

export default function CryptoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crypto Wallet</h1>
        <p className="text-muted-foreground">
          Manage your cryptocurrency wallet for receiving donations
        </p>
      </div>

      <div className="grid gap-6">
        <Suspense fallback={<WalletFormLoader />}>
          <SolanaWalletForm />
        </Suspense>

        {/* Additional crypto information */}
        <Card>
          <CardHeader>
            <CardTitle>About Crypto Donations</CardTitle>
            <CardDescription>
              How cryptocurrency donations work on our platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Benefits of Crypto Donations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Global accessibility for international donors</li>
                <li>• Faster settlement times</li>
                <li>• Transparent transactions on the blockchain</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">How It Works</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. Connect your Solana wallet address</li>
                <li>2. Share your cause with potential donors</li>
                <li>3. Donors send SOL directly to your wallet</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Supported Cryptocurrencies</h4>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Solana (SOL)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
