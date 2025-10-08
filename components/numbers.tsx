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
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="w-full h-auto text-black flex flex-col md:flex-row justify-around items-center px-6 lg:px-12 py-12"
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
          className="flex flex-col items-center text-center gap-3 md:gap-4 cursor-default"
        >
          <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-md">
            <Image src={itemData.img} alt={itemData.alt} width={60} height={60} />
          </div>
          <div className="text-2xl font-bold text-black">{itemData.value}</div>
          <div className="text-gray-600 font-medium text-sm md:text-base">
            {itemData.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
