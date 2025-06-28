"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import StepPersonalDetails from "./StepPersonalDetails";
import StepDocumentUpload from "./StepDocumentUpload";
import StepProgress from "./StepProgress";
import StepSuccess from "./StepSuccess";
import { uploadKycDocument } from "@/actions/kyc-actions";
import { useAuth } from "@/hooks/use-auth";

const documentTypes = [
  "NIN",
  "BVN",
  "International Passport",
  "Driver's License",
  "Voter's Card",
];

export default function KycSetupPage() {
  const [step, setStep] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal: "",
    country: "",
  });
  const { user } = useAuth();
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Validation for personal details
  const validatePersonalDetails = () => {
    if (
      !formData.fullName ||
      !formData.dob ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.postal ||
      !formData.country
    ) {
      setError("Please fill in all personal details.");
      return false;
    }
    setError(null);
    return true;
  };

  // Validation for document upload
  const validateDocument = () => {
    if (!selectedDoc) {
      setError("Please select a document type.");
      return false;
    }
    if (!file) {
      setError("Please upload a document file.");
      return false;
    }
    setError(null);
    return true;
  };

  // Step 3: Upload to backend
  const handleUpload = async () => {
    setUploadError(null);
    if (!user) {
      setUploadError("You must be signed in to submit KYC.");
      setStep(4);
      return;
    }
    try {
      const { documentUrl, error: uploadError } = await uploadKycDocument(
        user.id,
        file!,
        selectedDoc,
        {
          fullName: formData.fullName,
          dob: formData.dob,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal: formData.postal,
          country: formData.country,
        }
      );
      if (uploadError) {
        setUploadError(uploadError);
        setStep(4);
        return;
      }
      setStep(4);
    } catch (err: any) {
      setUploadError(err.message || "Failed to submit KYC");
      setStep(4);
    }
  };

  return (
    <div className="container py-10 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Upload a proof of your identity"}
            {step === 2 && "Upload your document"}
            {step === 3 && "Checking Your Documents..."}
            {step === 4 && "All done!"}
          </CardTitle>
          <CardDescription>
            {step === 1 &&
              "This helps us verify who you are and keep the platform safe for everyone."}
            {step === 2 && "Upload a valid document to verify your identity."}
            {step === 3 && "We're reviewing your identity to keep Refreeg safe and secure for everyone."}
            {step === 4 && "Thanks for verifying your identity — you can now fully access all features on Refreeg."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {step === 1 && (
            <StepPersonalDetails formData={formData} setFormData={setFormData} />
          )}
          {step === 2 && (
            <StepDocumentUpload
              selectedDoc={selectedDoc}
              setSelectedDoc={setSelectedDoc}
              file={file}
              setFile={setFile}
            />
          )}
          {step === 3 && (
            <StepProgress onComplete={handleUpload} />
          )}
          {step === 4 && (
            <>
              <StepSuccess />
              {uploadError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
            </>
          )}
          <div className="flex justify-end gap-2">
            {step === 1 && (
              <Button onClick={() => validatePersonalDetails() && setStep(2)}>
                Next
              </Button>
            )}
            {step === 2 && (
              <Button onClick={() => validateDocument() && setStep(3)}>
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
