"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"
import { useAuth } from "@/hooks/use-auth"
import { useAdmin } from "@/hooks/use-admin"
import { listCauses } from "@/actions/cause-actions"
import type { Cause } from "@/types"

export default function AdminCausesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isAdminOrManager, isLoading: adminLoading, approveCause, rejectCause } = useAdmin(user?.id)

  const [activeTab, setActiveTab] = useState("pending")
  const [causes, setCauses] = useState<Cause[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    causeId: string
    title: string
    reason: string
  }>({
    open: false,
    causeId: "",
    title: "",
    reason: "",
  })

  useEffect(() => {
    const loadCauses = async () => {
      if (!user?.id || !isAdminOrManager) {
        router.push("/dashboard")
        return
      }

      setIsLoading(true)
      const causesList = await listCauses({ status: activeTab as any })
      setCauses(causesList)
      setIsLoading(false)
    }

    if (!adminLoading && isAdminOrManager) {
      loadCauses()
    }
  }, [user?.id, adminLoading, isAdminOrManager, activeTab, router])

  const handleApprove = async (causeId: string) => {
    const success = await approveCause(causeId)
    if (success) {
      // Remove the cause from the list if we're on the pending tab
      if (activeTab === "pending") {
        setCauses((prevCauses) => prevCauses.filter((cause) => cause.id !== causeId))
      }
    }
  }

  const openRejectDialog = (causeId: string, title: string) => {
    setRejectDialog({
      open: true,
      causeId,
      title,
      reason: "",
    })
  }

  const handleReject = async () => {
    const success = await rejectCause(rejectDialog.causeId, rejectDialog.reason)
    if (success) {
      // Remove the cause from the list if we're on the pending tab
      if (activeTab === "pending") {
        setCauses((prevCauses) => prevCauses.filter((cause) => cause.id !== rejectDialog.causeId))
      }
      setRejectDialog((prev) => ({ ...prev, open: false }))
    }
  }

  if (adminLoading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  if (!isAdminOrManager) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You do not have permission to access this page.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Causes</h1>
        <p className="text-muted-foreground">Review and approve causes submitted by users.</p>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : causes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No {activeTab} causes to display.</p>
          ) : (
            <div className="grid gap-4">
              {causes.map((cause) => (
                <Card key={cause.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{cause.title}</CardTitle>
                        <CardDescription>
                          {new Date(cause.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardDescription>
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
                        {cause.status.charAt(0).toUpperCase() + cause.status.slice(1)}
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
                        <span className="font-medium">₦{cause.goal.toLocaleString()}</span>
                      </div>
                      {cause.status === "rejected" && cause.rejection_reason && (
                        <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
                          <strong>Rejection Reason:</strong> {cause.rejection_reason}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  {activeTab === "pending" && (
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="destructive" onClick={() => openRejectDialog(cause.id, cause.title)}>
                        Reject
                      </Button>
                      <Button onClick={() => handleApprove(cause.id)}>Approve</Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Cause</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{rejectDialog.title}". This will be shown to the user.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Rejection reason..."
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog((prev) => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectDialog.reason.trim()}>
              Reject Cause
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

