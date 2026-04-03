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
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 w-full max-w-md px-6">
        <h2 className="text-center text-2xl font-bold">
          Checking your documents
        </h2>

        <p className="text-center text-muted-foreground">
          Making sure everything is in order
        </p>

        <div className="w-full">
          <Progress value={progress} className="transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}
