"use client";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useInView } from "framer-motion";

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const spring = useSpring(0, {
    duration: 2000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) =>
    Math.floor(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
}

export default function Numbers() {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  const stats = [
    {
      img: "/profile.png",
      alt: "profile",
      label: "Registered Donors",
      value: 1000,
      prefix: "",
      suffix: "+",
    },
    {
      img: "/cash.png",
      alt: "cash",
      label: "Donated",
      value: 2000,
      prefix: "$",
      suffix: "+",
    },
    {
      img: "/forms.png",
      alt: "forms",
      label: "Petition Signatures",
      value: 1000,
      prefix: "",
      suffix: "+",
    },
  ];

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
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  useEffect(() => {
    if (isInView) {
      setShouldAnimate(true);
    }
  }, [isInView]);

  return (
    <motion.div
      ref={containerRef}
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
          <div className="text-lg sm:text-2xl font-bold">
            {shouldAnimate ? (
              <AnimatedNumber
                value={itemData.value}
                prefix={itemData.prefix}
                suffix={itemData.suffix}
              />
            ) : (
              <>
                {itemData.prefix}0{itemData.suffix}
              </>
            )}
          </div>
          <div className="text-gray-600 text-xs sm:text-sm md:text-base font-medium">
            {itemData.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
