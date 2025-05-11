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
  const [progress, setProgress] = useState(0);
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

  // Simulate validation progress
  const startValidation = () => {
    setStep(3);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setStep(4), 500);
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };

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

  return (
    <div className="container py-10 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Upload a proof of your identity"}
            {step === 2 && "Upload your document"}
            {step === 3 && "Checking Your Documents..."}
            {step === 4 && "All done you checked out!"}
          </CardTitle>
          <CardDescription>
            {step === 1 &&
              "This helps us verify who you are and keep the platform safe for everyone."}
            {step === 2 && "Upload a valid document to verify your identity."}
            {step === 3 &&
              "We're reviewing your identity to keep Refreeg safe and secure for everyone."}
            {step === 4 &&
              "Thanks for verifying your identity — you can now fully access all features on Refreeg."}
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="e.g. Alex"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, fullName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, dob: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="e.g. +234 907 737 3738"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address Line</Label>
                  <Input
                    id="address"
                    placeholder="e.g. Address Line"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, address: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, city: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, state: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal">Postal Code</Label>
                  <Input
                    id="postal"
                    placeholder="Postal code"
                    value={formData.postal}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, postal: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, country: e.target.value }))
                    }
                  />
                </div>
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => {
                  if (validatePersonalDetails()) setStep(2);
                }}
              >
                Next Step
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex justify-between mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="docType">Document Type</Label>
                <select
                  id="docType"
                  className="w-full border rounded-md p-2"
                  value={selectedDoc}
                  onChange={(e) => setSelectedDoc(e.target.value)}
                >
                  <option value="">Select document type</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Upload image</Label>
                <div className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg flex flex-col items-center justify-center p-8 cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept="image/*,application/pdf"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <span className="text-4xl mb-2">📄</span>
                    <span className="text-blue-700 font-medium">
                      Drag & Drop your image or{" "}
                      <span className="underline">browse files</span>
                    </span>
                    {file && (
                      <span className="mt-2 text-sm text-gray-700">
                        {file.name}
                      </span>
                    )}
                  </label>
                </div>
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => {
                  if (validateDocument()) startValidation();
                }}
              >
                Next Step
              </Button>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center space-y-6">
              <Progress value={progress} className="w-full" />
              <span className="text-purple-700 font-medium">progress</span>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center space-y-6">
              {/* You can replace this with your own illustration */}
              <span className="text-6xl">✅</span>
              <div className="text-center">
                <div className="text-xl font-semibold mb-2">
                  All done you checked out!
                </div>
                <div className="text-muted-foreground mb-4">
                  Thanks for verifying your identity — you can now fully access
                  all features on Refreeg.
                </div>
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => router.push("/dashboard/settings")}
              >
                Proceed
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
