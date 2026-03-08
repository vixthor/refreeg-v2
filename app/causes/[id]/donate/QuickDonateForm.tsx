"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Icons } from "@/components/icons";
import { calculateServiceFee } from "@/lib/utils";
import { usePayment } from "@/hooks/use-payment";

const PRESETS = [500, 1000, 5000, 10000];

interface QuickDonateFormProps {
  causeId: string;
  causeTitle: string;
  causeImage?: string | null;
  goal: number;
  raised: number;
  subaccount?: string;
  defaultName?: string;
  defaultEmail?: string;
  userId?: string;
}

export default function QuickDonateForm({
  causeId,
  causeTitle,
  causeImage,
  goal,
  raised,
  subaccount,
  defaultName = "",
  defaultEmail = "",
  userId,
}: QuickDonateFormProps) {
  const { initializePayment, isLoading } = usePayment();

  const [amount, setAmount] = useState<string>("");
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const donationAmount = Number(amount) || 0;
  const serviceFee = useMemo(() => calculateServiceFee(donationAmount), [donationAmount]);
  const total = donationAmount + serviceFee;
  const percent = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (donationAmount <= 0) return;

    await initializePayment({
      email,
      amount: donationAmount,
      causeId,
      id: userId || "",
      full_name: name,
      serviceFee,
      subaccounts: [{ subaccount: subaccount || "", share: donationAmount * 100 }],
      message,
      isAnonymous,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Quick donate</p>
          <h1 className="text-xl font-bold text-slate-900 leading-snug">{causeTitle}</h1>
          <p className="mt-2 text-xs text-slate-400">
            ₦{raised.toLocaleString()} raised of ₦{goal.toLocaleString()} goal
          </p>
          <Progress value={percent} className="mt-2 h-1.5" />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg space-y-5"
        >
          {/* Preset amounts */}
          <div>
            <Label className="text-xs text-slate-500 uppercase tracking-widest mb-2 block">
              Choose amount (₦)
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className={`rounded-xl border py-2 text-sm font-semibold transition-all ${
                    amount === String(p)
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300"
                  }`}
                >
                  {p >= 1000 ? `${p / 1000}k` : p}
                </button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Or enter custom amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2"
              min={1}
            />
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={isAnonymous}
              required={!isAnonymous}
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message of support…"
              rows={2}
            />
          </div>

          {/* Anonymous */}
          <div className="flex items-center gap-3">
            <Switch
              id="anon"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anon">Donate anonymously</Label>
          </div>

          {/* Fee breakdown */}
          {donationAmount > 0 && (
            <div className="rounded-xl bg-slate-50 p-3 space-y-1 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Donation</span>
                <span>₦{donationAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Service fee (max ₦10,000)</span>
                <span>₦{serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-700">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || donationAmount <= 0}
            className="w-full rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              `Donate ₦${total > 0 ? total.toLocaleString() : "Now"}`
            )}
          </Button>
        </form>

        {/* Back link */}
        <p className="text-center text-xs text-slate-400">
          Want to learn more?{" "}
          <Link
            href={`/causes/${causeId}`}
            className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            View full campaign →
          </Link>
        </p>
      </div>
    </div>
  );
}
