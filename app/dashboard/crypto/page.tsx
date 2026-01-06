"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SolanaWalletForm from "../settings/crypto-details-form";

export default function CryptoPage() {
  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Crypto Wallet
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage your cryptocurrency wallet for receiving donations
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        <SolanaWalletForm />=
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              About Crypto Donations
            </CardTitle>
            <CardDescription className="text-sm">
              How cryptocurrency donations work on our platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm sm:text-base">
                Benefits of Crypto Donations
              </h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li>• Global accessibility for international donors</li>
                <li>• Faster settlement times</li>
                <li>• Transparent transactions on the blockchain</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm sm:text-base">How It Works</h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li>1. Connect your Solana wallet address</li>
                <li>2. Share your cause with potential donors</li>
                <li>3. Donors send SOL directly to your wallet</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm sm:text-base">
                Supported Cryptocurrencies
              </h4>
              <div className="flex items-center gap-4 text-xs sm:text-sm">
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
