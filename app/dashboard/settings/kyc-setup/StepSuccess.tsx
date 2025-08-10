import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function StepSuccess() {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center">
      <CheckCircle2 className="w-16 h-16 mb-2" />
      <h1 className="text-4xl font-bold font-montserrat mb-2">All done!</h1>
      <p className="text-base font-montserrat mb-10">
        Thanks for verifying your identity — you can now fully access all
        features on Refreeg.
      </p>
      <Link href="/dashboard">
        <Button className="flex w-64 h-16 px-20 py-5 bg-primaryShades-700 text-white font-normal font-montserrat text-xl items-center gap-2">
          Proceed
        </Button>
      </Link>
    </div>
  );
}
