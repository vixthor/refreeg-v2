import { notFound, redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getVerificationStatus, updateVerificationStatus } from "@/actions/kyc-actions";
import { getProfile, updateProfile } from "@/actions/profile-actions";
import { createClient } from "@/lib/supabase/server";
import { Shield, User, Mail, Phone, MapPin, Calendar, FileText, CheckCircle, XCircle } from "lucide-react";

export default async function KycReviewPage({ params, searchParams }: { params: { userId: string }, searchParams: { kyc_alert?: string } }) {
  const userId = params.userId;
  const { status: kyc, error: kycError } = await getVerificationStatus(userId);
  const profile = await getProfile(userId);

  if (kycError || !kyc) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertTitle>No KYC Submission</AlertTitle>
          <AlertDescription>This user has not submitted KYC.</AlertDescription>
        </Alert>
      </div>
    );
  }
  if (!profile) {
    notFound();
  }

  async function approveAction() {
    "use server";
    if (!kyc) return;
    
    try {
      const { error } = await updateVerificationStatus(kyc.id, "approved");
      if (error) {
        console.error("Error approving KYC:", error);
        throw new Error(error);
      }
      redirect(`/dashboard/admin/users?kyc_alert=approved`);
    } catch (error) {
      console.error("Error in approveAction:", error);
      throw error;
    }
  }

  async function rejectAction() {
    "use server";
    if (!kyc) return;
    
    try {
      const { error } = await updateVerificationStatus(kyc.id, "rejected");
      if (error) {
        console.error("Error rejecting KYC:", error);
        throw new Error(error);
      }
      redirect(`/dashboard/admin/users?kyc_alert=rejected`);
    } catch (error) {
      console.error("Error in rejectAction:", error);
      throw error;
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      {searchParams.kyc_alert && (
        <Alert variant="default" className="mb-4">
          <AlertTitle>KYC {searchParams.kyc_alert === "approved" ? "Approved" : "Rejected"}</AlertTitle>
          <AlertDescription>
            KYC has been {searchParams.kyc_alert === "approved" ? "approved" : "rejected"} successfully.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Details Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </CardTitle>
            <CardDescription>Basic user information</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Name:</span>
                <span className="text-gray-700">{profile?.full_name || "-"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span className="text-gray-700">{profile?.email || "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KYC Status Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              KYC Status
            </CardTitle>
            <CardDescription>Verification status and document info</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge variant={kyc?.status === "approved" ? "default" : kyc?.status === "rejected" ? "destructive" : "secondary"}>
                  {kyc?.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Document Type:</span>
                <span className="text-gray-700">{kyc?.document_type || "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KYC Submission Details */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            KYC Submission Details
          </CardTitle>
          <CardDescription>Personal information provided by the user</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Personal Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Full Name:</span>
                  <span className="text-gray-700">{kyc?.full_name || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Date of Birth:</span>
                  <span className="text-gray-700">{kyc?.dob || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Phone:</span>
                  <span className="text-gray-700">{kyc?.phone || "-"}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Address Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Address:</span>
                  <span className="text-gray-700">{kyc?.address || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">City:</span>
                  <span className="text-gray-700">{kyc?.city || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">State:</span>
                  <span className="text-gray-700">{kyc?.state || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Postal Code:</span>
                  <span className="text-gray-700">{kyc?.postal || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Country:</span>
                  <span className="text-gray-700">{kyc?.country || "-"}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Document Preview */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Document Preview</h4>
            {kyc?.document_url ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                <a href={kyc.document_url} target="_blank" rel="noopener noreferrer" className="block">
                  <img 
                    src={kyc.document_url} 
                    alt="KYC Document" 
                    className="max-w-full max-h-64 object-contain border rounded shadow-sm hover:shadow-md transition-shadow" 
                  />
                  <p className="text-sm text-blue-600 mt-2 text-center">Click to view full size</p>
                </a>
              </div>
            ) : (
              <div className="border rounded-lg p-8 bg-gray-50 text-center text-gray-500">
                No document uploaded
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <form action={approveAction}>
              <Button 
                type="submit" 
                disabled={kyc?.status === "approved"}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve KYC
              </Button>
            </form>
            <form action={rejectAction}>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={kyc?.status === "rejected"}
                className="px-8 py-3"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject KYC
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 