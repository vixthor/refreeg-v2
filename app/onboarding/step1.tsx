"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Step1Props {
  user: any;
  onNext: (accountType: string) => void;
  onboardingData: any;
  updateOnboardingData: (key: string, value: any) => void;
}

const accountOptions = [
  { id: "individual", label: "I’m an individual" },
  { id: "creator", label: "I’m a creator" },
  { id: "nonprofit", label: "I’m a nonprofit" },
  { id: "organization", label: "I’m an organisation" },
];

export default function Step1({
  user,
  onNext,
  onboardingData,
  updateOnboardingData,
}: Step1Props) {
  const [selectedType, setSelectedType] = useState<string | null>(
    onboardingData.accountType || null
  );

  const handleNext = () => {
    if (!selectedType) return;
    updateOnboardingData("accountType", selectedType);
    onNext(selectedType);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Illustration */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <img src="/onboarding1.png" alt="Illustration" className="h-32 w-32" />
      </motion.div>

      {/* Title */}
      <h2 className="text-center text-2xl font-semibold text-gray-900">
        What kind of account best fits you?
      </h2>

      {/* Options */}
      <div className="mt-8 w-full max-w-md space-y-3">
        {accountOptions.map((opt) => (
          <motion.button
            key={opt.id}
            onClick={() => setSelectedType(opt.id)}
            whileTap={{ scale: 0.97 }}
            className={`w-full rounded-full border px-5 py-4 text-center text-base font-medium transition-all
              ${
                selectedType === opt.id
                  ? "bg-blue-50 border-blue-600 text-blue-700"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>

      {/* Proceed Button */}
      <div className="mt-8 w-full max-w-md">
        <Button
          onClick={handleNext}
          disabled={!selectedType}
          className="w-full bg-blue-600 py-6 text-white hover:bg-blue-700"
        >
          Proceed →
        </Button>
      </div>
    </div>
  );
}
