import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export default function StepProgress({ onComplete }: { onComplete: () => void }) {
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
      <Progress value={progress} className="w-full" />
      <span className="text-purple-700 font-medium">Sending your data for verification...</span>
    </div>
  );
} 