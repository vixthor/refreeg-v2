"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_SOL_TO_NAIRA_RATE = 282214.38; // Adjust based on current SOL/NGN rate

declare global {
  interface Window {
    solana?: any; // Phantom wallet typings
  }
}

interface SolanaDonationButtonProps {
  causeId: string;
  onDonationSuccess?: (amountInNaira: number) => void;
}

export default function SolanaDonationButton({
  causeId,
  onDonationSuccess,
}: SolanaDonationButtonProps) {
  const { toast } = useToast();
  const [donationAmount, setDonationAmount] = useState<string>("0.1");
  const [nairaEquivalent, setNairaEquivalent] = useState<string>("282214");
  const [formattedNairaEquivalent, setFormattedNairaEquivalent] =
    useState<string>("282,214.38");
  const [exchangeRate] = useState<number>(DEFAULT_SOL_TO_NAIRA_RATE);
  const [isDonating, setIsDonating] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState<boolean>(true);
  const [inputMode, setInputMode] = useState<"sol" | "naira">("sol");
  const params = useParams();
  const supabase = createClient();

  const formatNumberWithCommas = (value: string): string => {
    if (!value || isNaN(parseFloat(value))) return value;
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
  };

  const removeCommas = (value: string): string => {
    return value.replace(/,/g, "");
  };

  useEffect(() => {
    if (inputMode === "sol") {
      const amount = parseFloat(donationAmount);
      if (!isNaN(amount) && amount > 0) {
        const nairaValue = (amount * exchangeRate).toFixed(2);
        setNairaEquivalent(nairaValue);
        setFormattedNairaEquivalent(formatNumberWithCommas(nairaValue));
      } else {
        setNairaEquivalent("0.00");
        setFormattedNairaEquivalent("0.00");
      }
    }
  }, [donationAmount, exchangeRate, inputMode]);

  useEffect(() => {
    if (inputMode === "naira") {
      const amount = parseFloat(removeCommas(nairaEquivalent));
      if (!isNaN(amount) && amount > 0) {
        const solValue = (amount / exchangeRate).toFixed(6);
        setDonationAmount(solValue);
      } else {
        setDonationAmount("0.00");
      }
    }
  }, [nairaEquivalent, exchangeRate, inputMode]);

  const handleSolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMode("sol");
    setDonationAmount(e.target.value);
  };

  const handleNairaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMode("naira");
    const rawValue = removeCommas(e.target.value);
    setNairaEquivalent(rawValue);
    setFormattedNairaEquivalent(formatNumberWithCommas(rawValue));
  };

  useEffect(() => {
    const fetchRecipientAddress = async () => {
      try {
        console.log("Fetching recipient address for cause:", causeId);
        const { data: cause, error: causeError } = await supabase
          .from("causes")
          .select("user_id")
          .eq("id", causeId)
          .single();

        if (causeError) throw causeError;
        if (!cause) throw new Error("Cause not found");

        console.log("Found cause, fetching profile for user:", cause.user_id);
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("solana_wallet")
          .eq("id", cause.user_id)
          .single();

        if (profileError) throw profileError;
        if (!profile) throw new Error("Creator not found");

        console.log("Recipient wallet address:", profile.solana_wallet);
        setRecipientAddress(profile.solana_wallet || null);
      } catch (err) {
        console.error("Error fetching recipient address:", err);
        setError("Failed to load recipient wallet information");
        setRecipientAddress(null);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchRecipientAddress();
  }, [causeId, supabase]);

  const logDonation = async (
    causeId: string,
    txHash: string,
    amountInSol: number,
    amountInNaira: number,
    donorWalletAddress: string,
    recipientAddress: string
  ) => {
    try {
      console.log("Starting donation logging process...");

      // 1. Verify authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      console.log("User auth status:", { user, authError });

      if (authError || !user) {
        throw new Error(authError?.message || "User not authenticated");
      }

      // 2. Log to crypto_donations
      console.log("Inserting into crypto_donations...");
      const { data, error: insertError } = await supabase
        .from("crypto_donations")
        .insert({
          cause_id: causeId,
          tx_hash: txHash,
          amount_in_crypto: amountInSol,
          amount_in_naira: amountInNaira,
          donor_wallet_address: donorWalletAddress,
          recipient_address: recipientAddress,
          user_id: user.id,
          status: "completed",
          network: "Solana",
          currency: "SOL",
        })
        .select();

      if (insertError) {
        console.error("Insert failed:", {
          error: insertError,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        });
        throw insertError;
      }

      console.log("Donation logged successfully:", data);

      // 3. Update raised amount
      console.log("Updating raised amount...");
      const { data: causeData, error: selectError } = await supabase
        .from("causes")
        .select("raised")
        .eq("id", causeId)
        .single();

      if (selectError) throw selectError;

      const currentRaised = causeData?.raised || 0;
      const newRaised = currentRaised + amountInNaira;

      const { error: updateError } = await supabase
        .from("causes")
        .update({ raised: newRaised })
        .eq("id", causeId);

      if (updateError) {
        console.error("Update failed:", {
          currentRaised,
          amountInNaira,
          newRaised,
          error: updateError,
        });
        throw updateError;
      }

      console.log("Raised amount updated successfully");
      return data;
    } catch (error) {
      console.error("Complete donation logging error:", error);
      throw error;
    }
  };

  const handleDonate = useCallback(async () => {
    setError(null);
    setTxHash(null);
    setIsDonating(true);
    let needsManualReset = true;

    try {
      const amount = parseFloat(donationAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid donation amount");
      }

      if (!window.solana?.isPhantom) {
        throw new Error("Phantom wallet not installed");
      }

      if (!recipientAddress) {
        throw new Error("Recipient wallet address not available");
      }

      console.log("Initiating donation of", amount, "SOL to", recipientAddress);

      // Connect to wallet
      const response = await window.solana.connect();
      const publicKey = response.publicKey.toString();

      // Validate recipient address
      let recipientPublicKey;
      try {
        recipientPublicKey = new PublicKey(recipientAddress);
      } catch (e) {
        throw new Error("Invalid recipient Solana address");
      }

      // Create connection to Solana cluster
      const connection = new Connection("https://api.testnet.solana.com"); // Use the testnet endpoint here

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publicKey),
          toPubkey: recipientPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      // Set recent blockhash and fee payer
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      transaction.feePayer = new PublicKey(publicKey);

      // Sign transaction
      const signedTransaction = await window.solana.signTransaction(
        transaction
      );
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      console.log("Transaction submitted, hash:", signature);
      setTxHash(signature);
      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(
        signature,
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error("Transaction failed");
      }

      setIsDonating(false);
      needsManualReset = false;

      console.log("Transaction confirmed:", confirmation);
      toast({
        title: "Success",
        description: "Transaction confirmed! Thank you for your donation.",
      });

      const nairaAmount = parseFloat(removeCommas(nairaEquivalent));
      const solAmount = parseFloat(donationAmount);

      try {
        console.log("Logging donation to database...");
        await logDonation(
          causeId,
          signature,
          solAmount,
          nairaAmount,
          publicKey,
          recipientAddress
        );

        console.log("Donation successfully logged");
        onDonationSuccess?.(nairaAmount);
      } catch (dbError) {
        console.error("Database operation error:", dbError);
        toast({
          title: "Donation Record Error",
          description:
            "Transaction succeeded but we couldn't save the donation record. Please contact support with your transaction hash.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Donation error:", err);

      let userFriendlyMessage = "Donation failed. Please try again.";
      if (err.code === 4001 || err.message?.includes("User rejected")) {
        userFriendlyMessage = "Transaction was rejected by your wallet";
      } else if (err.message?.includes("insufficient funds")) {
        userFriendlyMessage = "Insufficient SOL balance";
      } else if (err.message?.includes("invalid address")) {
        userFriendlyMessage = "Invalid recipient address";
      }

      toast({
        title: "Error",
        description: userFriendlyMessage,
        variant: "destructive",
      });
      setError(userFriendlyMessage);

      if (needsManualReset) {
        setIsDonating(false);
      }
    } finally {
      if (needsManualReset) {
        setTimeout(() => {
          setIsDonating(false);
        }, 100);
      }
    }
  }, [
    donationAmount,
    nairaEquivalent,
    recipientAddress,
    causeId,
    supabase,
    toast,
    onDonationSuccess,
  ]);

  if (isLoadingAddress) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <p>Loading wallet information...</p>
      </div>
    );
  }

  if (!recipientAddress) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Donate with SOL
        </h2>
        <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 rounded-md">
          <p>The creator hasn't set up a Solana wallet address.</p>
          <p className="mt-2">
            <Link
              href={`/cause/${params.cause_id}/payment`}
              className="text-purple-600 hover:underline"
            >
              Please use another payment method
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Donate with SOL
      </h2>

      <div className="mb-4">
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Amount (SOL)
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">SOL</span>
          </div>
          <input
            type="number"
            id="amount"
            min="0.01"
            step="0.01"
            value={donationAmount}
            onChange={handleSolChange}
            className="block w-full pl-16 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isDonating}
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="nairaAmount"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Amount (Naira)
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">₦</span>
          </div>
          <input
            type="text"
            id="nairaAmount"
            value={formattedNairaEquivalent}
            onChange={handleNairaChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isDonating}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Using Solana Testnet</p>
      </div>

      <button
        onClick={handleDonate}
        disabled={isDonating}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          isDonating ? "bg-blue-400" : "bg-purple-600 hover:bg-blue-700"
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
      >
        {isDonating ? "Processing..." : "Donate with SOL"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {txHash && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
          <p>Thank you for your donation!</p>
          <p className="mt-1 text-sm">
            Transaction:{" "}
            <a
              href={`https://solscan.io/tx/${txHash}?cluster=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-800"
            >
              View on Solscan
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
