"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

export default function Numbers() {
  const stats = [
    {
      img: "/profile.png",
      alt: "profile",
      label: "Registered Donors",
      value: "1,000+",
    },
    {
      img: "/cash.png",
      alt: "cash",
      label: "Donated",
      value: "$2,000+",
    },
    {
      img: "/forms.png",
      alt: "forms",
      label: "Petition Signatures",
      value: "1,000+",
    },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" } as any,
    },
  };

  return (
    <motion.div
      className="w-full flex flex-col md:flex-row justify-between items-center px-4 sm:px-6 lg:px-12 py-10 text-black overflow-hidden"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {stats.map((itemData, index) => (
        <motion.div
          key={index}
          variants={item}
          whileHover={{ scale: 1.08, transition: { duration: 0.3 } }}
          className="flex flex-col items-center text-center gap-2 sm:gap-3 flex-1 min-w-0"
        >
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full shadow-md flex-shrink-0">
            <Image
              src={itemData.img}
              alt={itemData.alt}
              width={50}
              height={50}
              className="w-10 h-10 sm:w-[60px] sm:h-[60px]"
            />
          </div>
          <div className="text-lg sm:text-2xl font-bold">{itemData.value}</div>
          <div className="text-gray-600 text-xs sm:text-sm md:text-base font-medium">
            {itemData.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
