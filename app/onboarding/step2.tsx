"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

// ✅ Import MUI icons
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from "@mui/icons-material/Female";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";

interface Step2Props {
  user: any;
  onNext: () => void;
  onBack: () => void;
  onboardingData: any;
  updateOnboardingData: (key: string, value: any) => void;
}

// ✅ Replace symbols with MUI icons
const genderOptions = [
  { id: "male", label: "Male", icon: <MaleIcon fontSize="large" /> },
  { id: "female", label: "Female", icon: <FemaleIcon fontSize="large" /> },
  { id: "other", label: "Other", icon: <QuestionMarkIcon fontSize="large" /> },
];

export default function Step2({
  user,
  onNext,
  onBack,
  onboardingData,
  updateOnboardingData,
}: Step2Props) {
  const [selectedGender, setSelectedGender] = useState<string | null>(
    onboardingData.gender || null
  );

  const handleNext = () => {
    if (!selectedGender) return;
    updateOnboardingData("gender", selectedGender);
    onNext();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-8">
      {/* 3D User Icon */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Image
          src="/onboarding2.png"
          alt="3D User Icon"
          width={150}
          height={150}
        />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-center text-2xl font-semibold text-gray-900 mb-8 font-montserrat"
      >
        What's your gender?
      </motion.h2>

      {/* Gender Options */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full flex items-center justify-center gap-4 flex-wrap"
      >
        {genderOptions.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => setSelectedGender(option.id)}
            whileTap={{ scale: 0.97 }}
            className={`w-[200px] rounded-full border-2 px-6 py-4 text-center text-base font-medium transition-all duration-200 flex items-center justify-center space-x-3 ${
              selectedGender === option.id
                ? "bg-blue-50 border-blue-600 text-blue-700 shadow-md"
                : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <span className="text-2xl">{option.icon}</span>
            <span>{option.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Proceed Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-12 w-full max-w-md"
      >
        <Button
          onClick={handleNext}
          disabled={!selectedGender}
          className="w-full bg-blue-600 py-6 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Proceed →
        </Button>
      </motion.div>
    </div>
  );
}
