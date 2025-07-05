"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import type { Cause, CauseStatus } from "@/types";
import Image from "next/image";
import { useQueryState } from "nuqs";

export default function AdminCausesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "pending",
    parse: (value) => value,
    serialize: (value) => value,
  });
  const {
    isAdminOrManager,
    isLoading: adminLoading,
    approveCause,
    rejectCause,
    causes,
  } = useAdmin(user?.id, activeTab as CauseStatus);

  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    causeId: string;
    title: string;
    reason: string;
  }>({
    open: false,
    causeId: "",
    title: "",
    reason: "",
  });

  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    cause: Cause | null;
  }>({
    open: false,
    cause: null,
  });

  const handleApprove = async (causeId: string) => {
    await approveCause(causeId);
  };

  const openRejectDialog = (causeId: string, title: string) => {
    setRejectDialog({
      open: true,
      causeId,
      title,
      reason: "",
    });
  };

  const openPreviewDialog = (cause: Cause) => {
    setPreviewDialog({
      open: true,
      cause,
    });
  };

  const handleReject = async () => {
    await rejectCause(rejectDialog.causeId, rejectDialog.reason);
    setRejectDialog((prev) => ({ ...prev, open: false }));
  };

  if (adminLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!isAdminOrManager) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Causes</h1>
        <p className="text-muted-foreground">
          Review and approve causes submitted by users.
        </p>
      </div>

      <Tabs
        defaultValue={activeTab}
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="space-y-4">
          {causes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No {activeTab} causes to display.
            </p>
          ) : (
            <div className="grid gap-4">
              {causes.map((cause) => (
                <Card key={cause.id} className="max-w-sm">
                  <CardHeader>
                    {cause.image && (
                      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                        <Image
                          priority
                          src={cause.image}
                          alt={cause.title}
                          className="object-cover w-full h-full"
                          width={1000}
                          height={1000}
                        />
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{cause.title}</CardTitle>
                        <CardDescription>
                          {new Date(cause.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </CardDescription>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Created by: {cause.profiles?.full_name || "Anonymous"}
                        </div>
                      </div>
                      <Badge
                        variant={
                          cause.status === "approved"
                            ? "default"
                            : cause.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {cause.status.charAt(0).toUpperCase() +
                          cause.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="line-clamp-3">{cause.description}</p>
                    <div className="text-sm">
                      <div className="flex justify-between py-1">
                        <span>Category</span>
                        <span className="font-medium">{cause.category}</span>
                      </div>
                      <div className="flex justify-between py-1 border-t">
                        <span>Goal</span>
                        <span className="font-medium">
                          ₦{cause.goal.toLocaleString()}
                        </span>
                      </div>
                      {cause.status === "rejected" &&
                        cause.rejection_reason && (
                          <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
                            <strong>Rejection Reason:</strong>{" "}
                            {cause.rejection_reason}
                          </div>
                        )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      onClick={() => openPreviewDialog(cause)}
                    >
                      Preview
                    </Button>
                    <div className="flex gap-2">
                      {activeTab === "pending" && (
                        <>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              openRejectDialog(cause.id, cause.title)
                            }
                          >
                            Reject
                          </Button>
                          <Button onClick={() => handleApprove(cause.id)}>
                            Approve
                          </Button>
                        </>
                      )}
                      {activeTab === "rejected" && (
                        <Button onClick={() => handleApprove(cause.id)}>
                          Approve
                        </Button>
                      )}
                      {activeTab === "approved" && (
                        <Button
                          variant="destructive"
                          onClick={() =>
                            openRejectDialog(cause.id, cause.title)
                          }
                        >
                          Take Down
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Cause</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{rejectDialog.title}". This
              will be shown to the user.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Rejection reason..."
            value={rejectDialog.reason}
            onChange={(e) =>
              setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))
            }
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRejectDialog((prev) => ({ ...prev, open: false }))
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectDialog.reason.trim()}
            >
              Reject Cause
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onOpenChange={(open) => setPreviewDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {previewDialog.cause && (
            <>
              <DialogHeader>
                <DialogTitle>{previewDialog.cause.title}</DialogTitle>
                <DialogDescription>
                  Created by:{" "}
                  {previewDialog.cause.profiles?.full_name || "Anonymous"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {previewDialog.cause.image && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <Image
                      src={previewDialog.cause.image}
                      alt={previewDialog.cause.title}
                      className="object-cover w-full h-full"
                      width={1000}
                      height={1000}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-muted-foreground">
                        Status
                      </h4>
                      <Badge
                        variant={
                          previewDialog.cause.status === "approved"
                            ? "default"
                            : previewDialog.cause.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {previewDialog.cause.status.charAt(0).toUpperCase() +
                          previewDialog.cause.status.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">
                        Category
                      </h4>
                      <p>{previewDialog.cause.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">
                        Created At
                      </h4>
                      <p>
                        {new Date(
                          previewDialog.cause.created_at
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-muted-foreground">
                        Goal
                      </h4>
                      <p>₦{previewDialog.cause.goal.toLocaleString()}</p>
                    </div>
                    {previewDialog.cause.status === "rejected" &&
                      previewDialog.cause.rejection_reason && (
                        <div>
                          <h4 className="font-medium text-muted-foreground">
                            Rejection Reason
                          </h4>
                          <p className="text-destructive">
                            {previewDialog.cause.rejection_reason}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">
                    Description
                  </h4>
                  <p className="whitespace-pre-line">
                    {previewDialog.cause.description}
                  </p>
                </div>
                {previewDialog.cause.sections &&
                  previewDialog.cause.sections.length > 0 &&
                  previewDialog.cause.sections.map((section, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="text-xl font-semibold">
                        {section.heading}
                      </h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {section.description}
                      </p>
                    </div>
                  ))}
                {previewDialog.cause.updates && (
                  <div>
                    <h4 className="font-medium text-muted-foreground">
                      Updates
                    </h4>
                    <div className="space-y-4 mt-2">
                      {previewDialog.cause.updates.map((update) => (
                        <div key={update.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <h5 className="font-medium">{update.title}</h5>
                            <span className="text-sm text-muted-foreground">
                              {new Date(update.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-2 whitespace-pre-line">
                            {update.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={() =>
                    setPreviewDialog((prev) => ({ ...prev, open: false }))
                  }
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
