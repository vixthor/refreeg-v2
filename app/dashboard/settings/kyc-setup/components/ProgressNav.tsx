import React from "react";

const steps = [
  { label: "Identity Information" },
  { label: "Address Information" },
  { label: "Identity Upload" },
];

export default function ProgressNav({
  currentStep,
  completedSteps,
}: {
  currentStep: number;
  completedSteps: number[];
}) {
  return (
    <aside className="relative hidden md:flex flex-col items-start justify-start bg-[#0A3871] text-white w-[320px] h-full p-8 pt-14">
      {/* Curvy SVG lines as background */}
      <svg
        className="absolute left-0 bottom-0 w-full h-1/2 pointer-events-none"
        viewBox="0 0 320 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-20 180 Q 80 100 320 180"
          stroke="#fff"
          strokeOpacity="0.15"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M-20 200 Q 120 120 320 200"
          stroke="#fff"
          strokeOpacity="0.10"
          strokeWidth="2"
          fill="none"
        />
      </svg>
      <div className="flex flex-col gap-10 z-10 w-full">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.includes(idx);
          const isActive = currentStep === idx;
          return (
            <div key={step.label} className="flex items-center gap-4">
              <div
                className={
                  `flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all duration-500 ` +
                  (isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                    ? "bg-white text-blue-700"
                    : "bg-white text-blue-700")
                }
                style={{
                  transition: "background 0.4s, color 0.4s, border 0.4s",
                }}
              >
                <span
                  className={`font-bold text-lg transition-colors duration-500 ${
                    isCompleted
                      ? "text-white"
                      : isActive
                      ? "text-blue-700"
                      : "text-blue-700"
                  }`}
                >
                  {idx + 1}
                </span>
              </div>
              <span
                className={`font-medium text-base transition-colors duration-500 ${
                  isCompleted
                    ? "text-green-300"
                    : isActive
                    ? "text-white"
                    : "text-white/70"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
