"use client";

import { useState } from "react";
import { SignatureForm } from "@/components/signature-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Props from app/petitions/[id]/page.tsx server component:
 * - petition: the full petition object
 * - user: the logged-in user object (or null/undefined for guest)
 * - profile: the user's profile info (object)
 * - petitionStatus: the status string ('approved' or ...)
 * - creatorProfile: the petition creator's profile obj
 */
const PetitionSignatureClient = ({
  petition,
  user,
  profile,
  petitionStatus,
  creatorProfile,
}: {
  petition: any;
  user: any;
  profile: any;
  petitionStatus: string;
  creatorProfile: any;
}) => {
  const [showSignupModal, setShowSignupModal] = useState(false);

  return (
    <>
      <SignatureForm
        petitionId={petition.id}
        profile={profile}
        status={petitionStatus as "pending" | "rejected" | "approved"}
        subaccount={petition?.user?.sub_account_code}
        petitionData={{
          title: petition.title,
          creatorId: petition.user_id,
          creatorEmail: creatorProfile?.email || undefined,
          creatorName: petition.user?.name,
        }}
        onSuccess={() => {
          if (!user) setShowSignupModal(true);
        }}
      />
      {/* Modal for unauthenticated users */}
      <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thank you for supporting this petition!</DialogTitle>
            <DialogDescription>
              You can do even more! Sign up to be able to track your impact,
              receive updates, and support more great causes easily.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <a href="/auth/signin">
              <Button className="w-full">Sign up or Log in</Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PetitionSignatureClient;
