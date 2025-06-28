import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function StepManualInfo() {
  return (
    <Alert variant="default" className="flex flex-col items-center text-center">
      <AlertCircle className="h-8 w-8 mb-2 text-blue-500" />
      <AlertTitle className="text-lg">KYC Submitted!</AlertTitle>
      <AlertDescription>
        Your KYC submission has been received.<br />
        Our team will review your documents soon.<br />
        You will be notified once your verification is complete.
      </AlertDescription>
    </Alert>
  );
} 