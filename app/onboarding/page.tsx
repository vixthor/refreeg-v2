"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";
import Step5 from "./step5";
import NavigationLoader from "@/components/NavigationLoader";
import OnboardingNav from "./onboardingNav";
import {
  hasCompletedOnboarding,
  createOnboardingProfile,
} from "@/actions/profile-actions";
import { toast } from "@/components/ui/use-toast";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [direction, setDirection] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    accountType: "",
    gender: "",
    profile: {
      firstName: "",
      lastName: "",
      username: "",
      bio: "",
      location: "",
      website: "",
      phone: "",
    },
    interests: [],
    kycCompleted: false,
    consent: false,
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/signin");
        return;
      }

      // Check if user has already completed onboarding
      const hasCompleted = await hasCompletedOnboarding(user.id);
      if (hasCompleted) {
        router.push("/dashboard");
        return;
      }

      setUser(user);
      setIsLoading(false);
    };

    checkUser();
  }, [router, supabase.auth]);

  // Additional protection: Reset to step 1 if user tries to access steps 4-5 without completing step 3
  useEffect(() => {
    if (user && currentStep > 3) {
      // Check if profile data is complete (step 3 completion)
      // We need to check if the profile was actually created in the database
      // This is a fallback check - the main protection is in middleware
      const profileData = onboardingData.profile;
      const isStep3Complete = !!(
        profileData?.firstName &&
        profileData?.lastName &&
        profileData?.username &&
        profileData?.location &&
        profileData?.phone
      );

      if (!isStep3Complete) {
        setCurrentStep(1);
        toast({
          title: "Complete your profile first",
          description: "Please complete steps 1-3 before proceeding.",
          variant: "destructive",
        });
      }
    }
  }, [user, currentStep, onboardingData.profile]);

  // Load saved data from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedData = {
        accountType: localStorage.getItem("onboarding_account_type") || "",
        gender: localStorage.getItem("onboarding_gender") || "",
        profile: JSON.parse(
          localStorage.getItem("onboarding_profile") ||
            '{"firstName":"","lastName":"","username":"","bio":"","location":"","website":"","phone":""}'
        ),
        interests: JSON.parse(
          localStorage.getItem("onboarding_interests") || "[]"
        ),
        kycCompleted:
          localStorage.getItem("onboarding_kyc_completed") === "true",
        consent: localStorage.getItem("onboarding_consent") === "true",
      };
      setOnboardingData(savedData);
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < 5) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStep3Submit = async (profileData: any) => {
    setIsSubmitting(true);
    try {
      // Create user profile with all collected data
      await createOnboardingProfile(
        user.id,
        {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          username: profileData.username,
          location: profileData.location,
          phone: profileData.phone,
          email: user.email || "",
          profilePhoto: profileData.profilePhoto,
          accountType: onboardingData.accountType || "individual",
          gender: onboardingData.gender || "",
        },
        user.user_metadata?.avatar_url
      );

      // Don't clear onboarding data yet, just move to step 4
      setCurrentStep(4); // Go to KYC step
    } catch (error) {
      console.error("Error completing onboarding:", error);
      // Show error to user
      toast({
        title: "Error creating profile",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    router.push("/dashboard");
  };

  const updateOnboardingData = (key: string, value: any) => {
    setOnboardingData((prev) => ({ ...prev, [key]: value }));
    localStorage.setItem(
      `onboarding_${key}`,
      typeof value === "string" ? value : JSON.stringify(value)
    );
  };

  if (isLoading) {
    return <NavigationLoader />;
  }

  if (!user) {
    return null;
  }

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center">
      <OnboardingNav
        currentStep={currentStep}
        onBack={handleBack}
        showUserNav={currentStep >= 4}
      />
      <div className="w-full  px-8 py-12">
        {/* Progress indicator */}
        <div className="mb-8 flex justify-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-2 w-12 rounded-full transition-colors duration-300 ${
                i < currentStep ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>
          ))}
        </div>

        {/* Step content with smooth transitions */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="w-full"
            >
              {currentStep === 1 && (
                <Step1
                  user={user}
                  onNext={handleNext}
                  onboardingData={onboardingData}
                  updateOnboardingData={updateOnboardingData}
                />
              )}
              {currentStep === 2 && (
                <Step2
                  user={user}
                  onNext={handleNext}
                  onBack={handleBack}
                  onboardingData={onboardingData}
                  updateOnboardingData={updateOnboardingData}
                />
              )}
              {currentStep === 3 && (
                <Step3
                  user={user}
                  onNext={handleStep3Submit}
                  onBack={handleBack}
                  onboardingData={onboardingData}
                  updateOnboardingData={updateOnboardingData}
                  isSubmitting={isSubmitting}
                />
              )}
              {currentStep === 4 && (
                <Step4
                  user={user}
                  onNext={handleNext}
                  onBack={handleBack}
                  onboardingData={onboardingData}
                  updateOnboardingData={updateOnboardingData}
                />
              )}
              {currentStep === 5 && (
                <Step5
                  user={user}
                  onComplete={handleComplete}
                  onboardingData={onboardingData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
