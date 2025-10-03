"use client";

import React, { useEffect, useState } from "react";
import { Users, CreditCard, FileText } from "lucide-react";
import { motion } from "framer-motion";

const SLIDE_UP_DURATION = 0.8;
const STAGGER_DELAY = 0.15;

// Animation variants with proper easing types
const slideUp = (delay = 0) => ({
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: SLIDE_UP_DURATION,
    delay,
    ease: [0.4, 0, 0.2, 1] as const,
  },
});

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: {
    duration: SLIDE_UP_DURATION,
    delay,
    ease: [0.4, 0, 0.2, 1] as const,
  },
});

export default function Hero() {
  const [imagesShouldMove, setImagesShouldMove] = useState(true);

  // Stop image movement after 3 seconds to reduce overstimulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setImagesShouldMove(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Pattern */}
      <motion.div
        className="absolute inset-0 opacity-50"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <img
          src="/map.svg"
          alt="Background map"
          className="w-full h-full object-contain scale-100"
        />
      </motion.div>

      <div className="relative max-w-7xl mx-auto">
        {/* Hero Images */}
        <div className="relative flex justify-center items-center min-h-[600px]">
          {/* Top Left - Disaster Relief */}
          <motion.div
            className="absolute top-0 left-20 w-40 h-40 sm:w-48 sm:h-48"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: SLIDE_UP_DURATION,
              delay: 0.2,
              ease: [0.4, 0, 0.2, 1] as const,
            }}
          >
            <motion.div
              className="w-full h-full rounded-full overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
              animate={
                imagesShouldMove
                  ? {
                      y: [0, -10, 0],
                    }
                  : { y: 0 }
              }
              transition={
                imagesShouldMove
                  ? {
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: [0.4, 0, 0.6, 1] as const,
                      delay: 1.2,
                    }
                  : { duration: 0.5 }
              }
            >
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Disaster relief volunteers"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
          </motion.div>

          {/* Top Right - Community Group */}
          <motion.div
            className="absolute top-0 right-20 w-36 h-36 sm:w-44 sm:h-44"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: SLIDE_UP_DURATION,
              delay: 0.4,
              ease: [0.4, 0, 0.2, 1] as const,
            }}
          >
            <motion.div
              className="w-full h-full rounded-full overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
              animate={
                imagesShouldMove
                  ? {
                      y: [0, -10, 0],
                    }
                  : { y: 0 }
              }
              transition={
                imagesShouldMove
                  ? {
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: [0.4, 0, 0.6, 1] as const,
                      delay: 1.4,
                    }
                  : { duration: 0.5 }
              }
            >
              <img
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Community volunteers with boxes"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
          </motion.div>

          {/* Bottom Left - Volunteer */}
          <motion.div
            className="absolute bottom-0 left-32 w-36 h-36 sm:w-44 sm:h-44"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: SLIDE_UP_DURATION,
              delay: 0.6,
              ease: [0.4, 0, 0.2, 1] as const,
            }}
          >
            <motion.div
              className="w-full h-full rounded-full overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
              animate={
                imagesShouldMove
                  ? {
                      y: [0, -10, 0],
                    }
                  : { y: 0 }
              }
              transition={
                imagesShouldMove
                  ? {
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: [0.4, 0, 0.6, 1] as const,
                      delay: 1.6,
                    }
                  : { duration: 0.5 }
              }
            >
              <img
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Smiling volunteer in blue shirt"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
          </motion.div>

          {/* Center Left - Food Distribution */}
          <motion.div
            className="absolute left-8 top-1/2 transform -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: SLIDE_UP_DURATION,
              delay: 0.8,
              ease: [0.4, 0, 0.2, 1] as const,
            }}
          >
            <motion.div
              className="w-full h-full rounded-full overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
              animate={
                imagesShouldMove
                  ? {
                      y: [0, -10, 0],
                    }
                  : { y: 0 }
              }
              transition={
                imagesShouldMove
                  ? {
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: [0.4, 0, 0.6, 1] as const,
                      delay: 1.8,
                    }
                  : { duration: 0.5 }
              }
            >
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Volunteer distributing food"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
          </motion.div>

          {/* Center Right - Community Helper */}
          <motion.div
            className="absolute right-8 top-1/2 transform -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: SLIDE_UP_DURATION,
              delay: 1.0,
              ease: [0.4, 0, 0.2, 1] as const,
            }}
          >
            <motion.div
              className="w-full h-full rounded-full overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
              animate={
                imagesShouldMove
                  ? {
                      y: [0, -10, 0],
                    }
                  : { y: 0 }
              }
              transition={
                imagesShouldMove
                  ? {
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: [0.4, 0, 0.6, 1] as const,
                      delay: 2.0,
                    }
                  : { duration: 0.5 }
              }
            >
              <img
                src="https://images.unsplash.com/photo-1616680214084-22670de1bc82?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Community volunteer with boxes"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
          </motion.div>

          {/* Central Content */}
          <div className="text-center max-w-2xl mx-auto px-4 z-10">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-8 leading-tight"
              {...slideUp(0.3)}
            >
              Fund Change. Build Trust.
              <br />
              <span className="text-gray-700">Create Impact.</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-gray-600 mb-12 max-w-xl mx-auto leading-relaxed"
              {...slideUp(0.5)}
            >
              RefreeG gives nonprofits a transparent and powerful way to raise
              funds globally. From disaster relief to community projects, we
              make it easy for donors to trust your mission and support your
              cause
            </motion.p>

            <motion.button
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-lg text-lg shadow-lg relative z-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -5, 0], // Continuous gentle movement
              }}
              transition={{
                duration: SLIDE_UP_DURATION,
                delay: 0.7,
                ease: [0.4, 0, 0.2, 1] as const,
                y: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                },
              }}
              whileHover={{
                scale: 1.05,
                y: -3, // Enhanced movement on hover
                transition: {
                  duration: 0.3,
                  y: { duration: 0.5, ease: "easeInOut" },
                },
              }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Nonprofit Campaign
              <span className="ml-2">→</span>
            </motion.button>
          </div>
        </div>

        {/* Statistics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          {[
            {
              icon: Users,
              color: "blue",
              text: "Over 1,000 registered donors",
            },
            { icon: CreditCard, color: "green", text: "Over $2,000 donated" },
            {
              icon: FileText,
              color: "purple",
              text: "Over 1,000 signatures on petitions",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * STAGGER_DELAY,
                ease: "easeOut",
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              viewport={{ once: true }}
            >
              <motion.div
                className="flex items-center mb-4"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * STAGGER_DELAY + 0.3,
                  type: "spring",
                  stiffness: 200,
                }}
                viewport={{ once: true }}
              >
                <div
                  className={`w-12 h-12 bg-${stat.color}-100 rounded-full flex items-center justify-center`}
                >
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {stat.text}
              </h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
