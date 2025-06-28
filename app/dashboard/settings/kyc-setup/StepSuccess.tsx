import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

export default function StepSuccess() {
  return (
    <Alert variant="default" className="flex flex-col items-center text-center">
      <CheckCircle2 className="h-8 w-8 mb-2 text-green-500" />
      <AlertTitle className="text-lg">Submission Successful!</AlertTitle>
      <AlertDescription>
        Your KYC submission has been received.<br />
        Our team will review your documents soon.<br />
        You will be notified once your verification is complete.
      </AlertDescription>
    </Alert>
  );
} 