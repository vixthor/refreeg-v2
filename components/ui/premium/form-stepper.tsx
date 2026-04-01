"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormStepperProps {
  steps: string[];
  currentStep: number;
}

export function FormStepper({ steps, currentStep }: FormStepperProps) {
  return (
    <div className="mx-auto mb-6 w-full max-w-4xl px-0 sm:mb-8 md:mb-12 md:px-4">
      {/* Mobile Step Indicator (Simplified) */}
      <div className="mb-5 flex items-start justify-between gap-3 md:hidden">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-brand">
            Step {currentStep} of {steps.length}
          </span>
          <span className="max-w-[140px] text-sm font-semibold text-gray-900">
            {steps[currentStep - 1]}
          </span>
        </div>
        <div className="flex flex-1 justify-end gap-1.5 pt-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 min-w-0 flex-1 rounded-full transition-all duration-300",
                currentStep === index + 1
                  ? "bg-brand"
                  : currentStep > index + 1
                    ? "bg-brand/40"
                    : "bg-gray-100",
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop/Tablet Step Indicator (Full) */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <div
              key={step}
              className="flex flex-col items-center relative flex-1"
            >
              {/* Line between steps */}
              {index > 0 && (
                <div className="absolute top-5 -left-1/2 w-full h-[2px] bg-gray-100 -z-10">
                  <motion.div
                    className="h-full bg-brand"
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted || isActive ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              )}

              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                  isCompleted
                    ? "bg-brand border-brand text-white"
                    : isActive
                      ? "bg-white border-brand text-brand ring-4 ring-brand/10"
                      : "bg-white border-gray-200 text-gray-400",
                )}
                initial={false}
                animate={isActive ? { scale: 1.15 } : { scale: 1 }}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-semibold">{stepNumber}</span>
                )}
              </motion.div>

              <span
                className={cn(
                  "mt-3 text-xs font-medium transition-colors duration-300 text-center px-1",
                  isActive ? "text-brand" : "text-gray-500",
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
