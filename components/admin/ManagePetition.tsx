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
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listPetitions,
  updatePetitionStatus,
  getPetition,
} from "@/actions/petition-actions";
import type { Petition, PetitionStatus, PetitionWithUser } from "@/types";
import { format } from "date-fns";
import { categories } from "@/lib/categories";

export default function ManagePetition() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<PetitionStatus>("pending");

  const { data: petitions = [], isLoading } = useQuery<Petition[]>({
    queryKey: ["adminPetitions", activeTab],
    queryFn: () => listPetitions({ status: activeTab }),
    enabled: !!user?.id,
  });

  const approveMutation = useMutation({
    mutationFn: async (petitionId: string) => {
      await updatePetitionStatus(petitionId, "approved");
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Petition approved",
        description: "The petition has been approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["adminPetitions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error approving petition",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({
      petitionId,
      reason,
    }: {
      petitionId: string;
      reason: string;
    }) => {
      await updatePetitionStatus(petitionId, "rejected", reason);
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Petition rejected",
        description: "The petition has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["adminPetitions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error rejecting petition",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    petitionId: string;
    title: string;
    reason: string;
  }>({ open: false, petitionId: "", title: "", reason: "" });

  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    petition: PetitionWithUser | null;
    isLoading: boolean;
  }>({ open: false, petition: null, isLoading: false });

  const openRejectDialog = (petitionId: string, title: string) => {
    setRejectDialog({ open: true, petitionId, title, reason: "" });
  };

  const handleReject = async () => {
    await rejectMutation.mutateAsync({
      petitionId: rejectDialog.petitionId,
      reason: rejectDialog.reason,
    });
    setRejectDialog((prev) => ({ ...prev, open: false }));
  };

  const handleApprove = async (petitionId: string) => {
    await approveMutation.mutateAsync(petitionId);
  };

  const openDetailDialog = async (petitionId: string) => {
    setDetailDialog((prev) => ({ ...prev, open: true, isLoading: true }));
    try {
      const detailed = await getPetition(petitionId);
      setDetailDialog({ open: true, isLoading: false, petition: detailed });
    } catch (e) {
      setDetailDialog({ open: true, isLoading: false, petition: null });
    }
  };

  const closeDetailDialog = () =>
    setDetailDialog({ open: false, petition: null, isLoading: false });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Petitions</h1>
        <p className="text-muted-foreground">
          Review and approve petitions submitted by users.
        </p>
      </div>

      <Tabs
        value={activeTab}
        className="space-y-4"
        onValueChange={(v) => setActiveTab(v as PetitionStatus)}
      >
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="space-y-4">
          {petitions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No {activeTab} petitions to display.
            </p>
          ) : (
            <div className="grid gap-4">
              {petitions.map((p) => (
                <Card key={p.id} className="max-w-sm">
                  <CardHeader>
                    {p.image && (
                      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                        <Image
                          priority
                          src={p.image}
                          alt={p.title}
                          className="object-cover w-full h-full"
                          width={1000}
                          height={1000}
                        />
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle
                          className="cursor-pointer hover:text-primary transition-colors"
                          onClick={() => openDetailDialog(p.id)}
                        >
                          {p.title}
                        </CardTitle>
                        <CardDescription>
                          {new Date(p.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardDescription>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Created by: {p.profiles?.full_name || "Anonymous"}
                        </div>
                      </div>
                      <Badge
                        variant={
                          p.status === "approved"
                            ? "default"
                            : p.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <div className="flex justify-between py-1">
                        <span>Category</span>
                        <span className="font-medium">{p.category}</span>
                      </div>
                      <div className="flex justify-between py-1 border-t">
                        <span>Goal</span>
                        <span className="font-medium">
                          {p.goal.toLocaleString()} signatures
                        </span>
                      </div>
                      {p.days_active !== null &&
                        p.days_active !== undefined && (
                          <div className="flex justify-between py-1 border-t">
                            <span>Days Active</span>
                            <span className="font-medium">
                              {p.days_active} days
                            </span>
                          </div>
                        )}
                      {p.status === "rejected" && p.rejection_reason && (
                        <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
                          <strong>Rejection Reason:</strong>{" "}
                          {p.rejection_reason}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailDialog(p.id)}
                    >
                      View Details
                    </Button>
                    <div className="flex gap-2">
                      {activeTab === "pending" && (
                        <>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openRejectDialog(p.id, p.title)}
                          >
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => handleApprove(p.id)}>
                            Approve
                          </Button>
                        </>
                      )}
                      {activeTab === "rejected" && (
                        <Button size="sm" onClick={() => handleApprove(p.id)}>
                          Approve
                        </Button>
                      )}
                      {activeTab === "approved" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openRejectDialog(p.id, p.title)}
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

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Petition</DialogTitle>
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
              Reject Petition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialog.open} onOpenChange={closeDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Petition Details</DialogTitle>
            <DialogDescription>
              Full details of the petition for review
            </DialogDescription>
          </DialogHeader>

          {detailDialog.isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : detailDialog.petition ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {detailDialog.petition.title}
                    </h2>
                    <p className="text-muted-foreground">
                      {
                        categories.find(
                          (c) => c.id === detailDialog.petition?.category
                        )?.name
                      }
                    </p>
                  </div>
                  <Badge
                    variant={
                      detailDialog.petition.status === "approved"
                        ? "default"
                        : detailDialog.petition.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {detailDialog.petition.status.charAt(0).toUpperCase() +
                      detailDialog.petition.status.slice(1)}
                  </Badge>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Creator Information</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {detailDialog.petition.user.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {detailDialog.petition.user.email}
                    </p>
                    <p>
                      <span className="font-medium">Created:</span>{" "}
                      {format(
                        new Date(detailDialog.petition.created_at),
                        "PPP"
                      )}
                    </p>
                    {detailDialog.petition.status === "approved" && (
                      <p>
                        <span className="font-medium">Approved:</span>{" "}
                        {format(
                          new Date(detailDialog.petition.updated_at),
                          "PPP"
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {detailDialog.petition.image && (
                <div className="space-y-2">
                  <h3 className="font-medium">Cover Image</h3>
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <Image
                      src={detailDialog.petition.image}
                      alt={detailDialog.petition.title}
                      className="object-cover w-full h-full"
                      width={800}
                      height={400}
                    />
                  </div>
                </div>
              )}

              {detailDialog.petition.sections &&
                detailDialog.petition.sections.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Additional Sections</h3>
                    {detailDialog.petition.sections.map((section, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">{section.heading}</h4>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <h3 className="font-medium mb-2">Goal</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Target:</span>{" "}
                      {detailDialog.petition.goal.toLocaleString()} signatures
                    </p>
                    <p>
                      <span className="font-medium">Collected:</span>{" "}
                      {detailDialog.petition.raised.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Duration</h3>
                  <div className="space-y-1 text-sm">
                    {detailDialog.petition.days_active !== null &&
                    detailDialog.petition.days_active !== undefined ? (
                      <p>
                        <span className="font-medium">Days Active:</span>{" "}
                        {detailDialog.petition.days_active} days
                      </p>
                    ) : (
                      <p className="text-muted-foreground">Duration not set</p>
                    )}
                  </div>
                </div>
              </div>

              {detailDialog.petition.status === "rejected" &&
                detailDialog.petition.rejection_reason && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <h3 className="font-medium text-destructive mb-2">
                      Rejection Reason
                    </h3>
                    <p className="text-sm text-destructive">
                      {detailDialog.petition.rejection_reason}
                    </p>
                  </div>
                )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load petition details
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDetailDialog}>
              Close
            </Button>
            {detailDialog.petition && (
              <div className="flex gap-2">
                {detailDialog.petition.status === "pending" && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        closeDetailDialog();
                        openRejectDialog(
                          detailDialog.petition!.id,
                          detailDialog.petition!.title
                        );
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        closeDetailDialog();
                        handleApprove(detailDialog.petition!.id);
                      }}
                    >
                      Approve
                    </Button>
                  </>
                )}
                {detailDialog.petition.status === "rejected" && (
                  <Button
                    onClick={() => {
                      closeDetailDialog();
                      handleApprove(detailDialog.petition!.id);
                    }}
                  >
                    Approve
                  </Button>
                )}
                {detailDialog.petition.status === "approved" && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      closeDetailDialog();
                      openRejectDialog(
                        detailDialog.petition!.id,
                        detailDialog.petition!.title
                      );
                    }}
                  >
                    Take Down
                  </Button>
                )}
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
