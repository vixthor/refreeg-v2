"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { AuthTestimonials } from "@/components/ui/auth-testimonials";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { sendWelcomeEmailToUser } from "@/services/mail";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Show loading toast
    toast({
      title: "Creating your account...",
      description: "Please wait while we set up your RefreeG account.",
    });

    try {
      await signUp(email, password, "User", "individual");

      // Success toast will be shown by the signUp function
    } catch (error) {
      // Error toast will be shown by the signUp function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Left side - White background with form */}
      <div className="flex md:w-2/5 w-full flex-col items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-800">
              Welcome to RefreeG
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Create an account to start fundraising or donating
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <LabelInputContainer>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </LabelInputContainer>
            </div>
            <div className="mb-4">
              <LabelInputContainer>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </LabelInputContainer>
            </div>
            <div className="mb-8">
              <LabelInputContainer>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </LabelInputContainer>
            </div>

            <Button
              className="group/btn relative h-10 w-full rounded-md font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] flex items-center justify-center gap-2"
              type="submit"
              disabled={isLoading}
              variant="default"
            >
              <span>Sign up</span>
              <BottomGradient />
            </Button>

            <div className="my-2 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />

            <div className="flex flex-col space-y-4">
              <button
                className="group/btn shadow-input relative flex h-10 w-full items-center justify-center space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black"
                type="button"
                onClick={signInWithGoogle}
                disabled={isLoading}
              >
                <Image
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                  width={18}
                  height={18}
                />
                <span className="text-sm text-neutral-700">Google</span>
                <BottomGradient />
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-neutral-600">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-black hover:underline"
              >
                Sign In
              </Link>
            </div>
            <div className="mt-2 text-sm text-center text-neutral-600">
              By signing up, you agree to our{" "}
              <Link
                href="/terms"
                className="font-medium text-black hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-black hover:underline"
              >
                Privacy Policy
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Blue background with testimonial */}
      <div className="hidden md:flex md:w-3/5 items-center justify-center bg-[#003366] px-8">
        <AuthTestimonials />
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
