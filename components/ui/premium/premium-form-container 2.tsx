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
    <div className="min-h-screen w-full mesh-gradient py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("max-w-4xl mx-auto", className)}
      >
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-5xl font-extrabold text-gradient mb-4"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            {description}
          </motion.p>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="p-8 md:p-12">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}
