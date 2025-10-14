"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Icons } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";
import { useSignature } from "@/hooks/use-signature";
import { useProfile } from "@/hooks/use-profile";
import { sendPetitionSignedEmailToUser, sendNewSignatureNotificationEmail } from "@/services/mail";

interface SignatureFormProps {
  petitionId: string;
  profile: {
    email?: string;
    name?: string;
    id?: string;
  };
  subaccount?: string;
  status: "pending" | "rejected" | "approved";
  petitionData?: { // Add petition data for email context
    title?: string;
    creatorId?: string;
    creatorEmail?: string | null; // Change to accept null
    creatorName?: string;
  };
}

export function SignatureForm({
  petitionId,
  profile,
  status,
  subaccount,
  petitionData = {},
}: SignatureFormProps) {
  const { createUserSignature, isLoading } = useSignature();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    message: "",
    isAnonymous: false,
  });

  const isDisabled =
    status === "pending" || status === "rejected" ? true : false;
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  console.log(formData.isAnonymous);
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isAnonymous: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const ok = await createUserSignature(petitionId, profile.id, {
        amount: 1,
        email: formData.email,
        name: formData.name,
        message: formData.message,
        isAnonymous: formData.isAnonymous,
      });

      if (!ok) {
        setFriendlyError("We couldn't process your signature. Please try again.");
        return;
      }

      setFriendlyError(null);

      // Send confirmation email to the signer
      try {
        await sendPetitionSignedEmailToUser(
          formData.email,
          formData.isAnonymous ? "Supporter" : formData.name,
          petitionData.title || "the petition",
          `${window.location.origin}/petitions/${petitionId}`,
          formData.isAnonymous
        );
        console.log("Petition signed confirmation email sent");
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      // Send notification to petition creator (if we have creator info)
      if (petitionData.creatorEmail && petitionData.creatorName && petitionData.title) {
        try {
          await sendNewSignatureNotificationEmail(
            petitionData.creatorEmail, // This is now string | null, but we checked it exists
            petitionData.creatorName,
            petitionData.title,
            `${window.location.origin}/petitions/${petitionId}`,
            formData.isAnonymous ? "Anonymous Supporter" : formData.name,
            formData.message
          );
          console.log("New signature notification sent to creator");
        } catch (notificationError) {
          console.error("Failed to send creator notification:", notificationError);
        }
      }

    } catch (error) {
      console.error("Error submitting signature:", error);
      setFriendlyError("We couldn't process your signature. Please try again.");
    }
  };

  const signatureAmount = 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign a petition</CardTitle>
        <CardDescription>
          Your contribution helps make a difference
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {friendlyError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{friendlyError}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required={!formData.isAnonymous}
              disabled={formData.isAnonymous}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Leave a message of support"
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={formData.isAnonymous}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="anonymous">Sign anonymously</Label>
          </div>

          {signatureAmount > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Signature</span>
                <span>{signatureAmount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {/* REMOVE THIS TEST BUTTON IN PRODUCTION */}
          {/* <Button 
            type="button" 
            variant="outline"
            onClick={async () => {
              try {
                await sendPetitionSignedEmailToUser(
                  formData.email || "test@example.com",
                  formData.name || "Test User",
                  petitionData.title || "Test Petition",
                  `${window.location.origin}/petitions/${petitionId}`,
                  formData.isAnonymous
                );
                alert("Test petition signed email sent successfully!");
              } catch (error) {
                alert("Failed to send test petition signed email");
              }
            }}
          >
            Test Signed Email
          </Button> */}
          
          <Button
            type="submit"
            disabled={isLoading || isDisabled}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Sign Now"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}