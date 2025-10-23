"use client";

import React from 'react'
import { FaArrowRight } from "react-icons/fa6";
import { motion } from "framer-motion";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.2, ease: "easeOut" as any },
  }),
};

export default function Hero() {
    return (
        <div className="relative w-full min-h-[30vh] flex items-center justify-center px-6 md:px-10 py-16">
            {/* Hexagon background with light blue fill */}
            <div className="relative w-[727px] max-w-full aspect-square flex items-center justify-center">
                <div
                    className="absolute inset-0"
                    style={{ clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)' }}
                >
                    <div className="w-full h-full bg-[#EAF3FF] border border-[#CFE4FF] shadow-[0_12px_32px_rgba(16,44,88,0.08)]" />
                </div>

                {/* Centered text content */}
                <div className="relative z-10 flex flex-col items-center text-center gap-6 px-6">
                    <motion.h1 
                        className="text-2xl md:text-4xl lg:text-5xl font-semibold text-slate-900"
                        custom={0}
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        We are RefreeG
                    </motion.h1>
                    <motion.p 
                        className="text-sm md:text-base lg:text-lg text-slate-700 max-w-[680px]"
                        custom={1}
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        Built by people who believe funding should be simple, fair, and accessible to everyone. We believe that trust is the foundation of every relationship, and it deserves to be rewarded.
                    </motion.p>
                    <motion.a 
                        href="/dashboard/causes/create" 
                        className="text-sm md:text-base inline-flex items-center gap-x-2 text-white px-5 py-3 bg-[#0B5CB8] hover:bg-[#0A53A6] rounded-lg shadow-sm"
                        custom={2}
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Start a Cause Now <FaArrowRight />
                    </motion.a>
                </div>
            </div>
        </div>
    )
}
