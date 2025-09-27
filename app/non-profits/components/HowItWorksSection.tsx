"use client";

import React from "react";
import { motion } from "framer-motion";

const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      title: "Create Your Campaign",
      description: "Set up your nonprofit profile and cause in minutes.",
      tip: "Get tips for creating and scaling your campaign",
    },
    {
      number: "2",
      title: "Get Verified",
      description: "Our fraud-compliance checks ensure donor trust.",
      tip: "Get tips for creating and scaling transparent campaigns.",
    },
    {
      number: "3",
      title: "Raise Globally",
      description: "Accept donations from anywhere in multiple currencies.",
      tip: "Get tips for setting up your wallets and bank accounts",
    },
    {
      number: "4",
      title: "Report & Update",
      description: "Share real-time impact stories with your community.",
      tip: "Get tips on how to provide updates and motivate your community",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  const numberVariants = {
    hidden: { scale: 0, rotate: -180, opacity: 0 },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        type: "spring" as const,
        stiffness: 300,
        damping: 15,
      },
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.3,
        type: "spring" as const,
        stiffness: 400,
      },
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
  };

  const numberGlowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 0.3,
      },
    },
    hover: {
      opacity: 0.8,
      scale: 1.2,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <section className="relative bg-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>

          <motion.p
            className="text-2xl text-gray-600 font-medium mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Simple, Secure, Impactful.
          </motion.p>

          {/* Separator Line */}
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          />
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="group"
              variants={itemVariants}
            >
              <div className="flex gap-6">
                {/* Number Circle with Enhanced Animations */}
                <motion.div 
                  className="flex-shrink-0 relative"
                  variants={numberVariants}
                  whileHover="hover"
                  animate="pulse"
                >
                  {/* Glow Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-md opacity-0"
                    variants={numberGlowVariants}
                    whileHover="hover"
                  />
                  
                  {/* Main Number Circle */}
                  <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 z-10">
                    <motion.span 
                      className="text-2xl font-bold text-white relative z-20"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1 + 0.3,
                        type: "spring",
                        stiffness: 200
                      }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {step.number}
                    </motion.span>
                    
                    {/* Inner shine effect */}
                    <motion.div
                      className="absolute top-1 left-1 right-1 bottom-1 bg-gradient-to-br from-white/20 to-transparent rounded-full"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                      viewport={{ once: true }}
                    />
                  </div>

                  {/* Floating particles */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.1 + 0.7,
                      type: "spring" 
                    }}
                    viewport={{ once: true }}
                    animate={{ 
                      y: [0, -5, 0],
                      rotate: [0, 180, 360]
                    }}
                  />
                </motion.div>

                {/* Content */}
                <div className="flex-1">
                  <motion.h3
                    className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                  >
                    {step.title}
                  </motion.h3>

                  <motion.p
                    className="text-gray-600 text-lg mb-3 leading-relaxed"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.4 }}
                    viewport={{ once: true }}
                  >
                    {step.description}
                  </motion.p>

                  <motion.p
                    className="text-purple-500 text-sm font-medium flex items-center gap-2"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.5 }}
                    viewport={{ once: true }}
                  >
                    <motion.svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        repeatType: "reverse" as const,
                        delay: index * 0.5
                      }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                        clipRule="evenodd"
                      />
                    </motion.svg>
                    {step.tip}
                  </motion.p>
                </div>
              </div>

              {/* Connector Line (except for last item) */}
              {index < steps.length - 2 && (
                <motion.div
                  className="ml-8 mt-4 mb-4 relative"
                  initial={{ opacity: 0, height: 0 }}
                  whileInView={{ opacity: 1, height: 40 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-purple-300 to-blue-300"></div>
                  <div className="absolute left-0 top-0 w-2 h-2 bg-purple-500 rounded-full -ml-1"></div>
                  <div className="absolute left-0 bottom-0 w-2 h-2 bg-blue-500 rounded-full -ml-1"></div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-100 rounded-full opacity-50 blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
    </section>
  );
};

export default HowItWorksSection;