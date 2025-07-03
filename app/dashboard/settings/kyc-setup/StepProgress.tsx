import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export default function StepProgress({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return p + 10;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center space-y-6">
      <span className="self-stretch text-center justify-start text-black text-2xl font-bold font-montserrat">
        Checking Your Documents...
      </span>
      <span className="self-stretch text-center justify-start text-black/60 text-base font-medium font-ontserrat leading-snug">
        We're reviewing your identity to keep Refreeg safe and secure for
        everyone.
      </span>
      <Progress value={progress} className="w-full" />
    </div>
  );
}
