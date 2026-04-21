"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumFormContainerProps {
  children: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function PremiumFormContainer({
  children,
  title,
  description,
  className,
}: PremiumFormContainerProps) {
  return (
    <div className="min-h-screen w-full mesh-gradient px-3 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("max-w-4xl mx-auto", className)}
      >
        <div className="mb-6 text-center sm:mb-10 md:mb-12">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-3 text-3xl font-extrabold text-gradient sm:mb-4 sm:text-4xl md:text-5xl"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-sm leading-6 text-gray-600 sm:text-base md:text-lg"
          >
            {description}
          </motion.p>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="p-4 sm:p-6 md:p-10 lg:p-12">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}
