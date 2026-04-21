"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.2, ease: "easeOut" as any },
  }),
};

type TeamMemberProps = {
  imageSrc: string;
  name: string;
  role: string;
  location?: string;
  width?: number;
  height?: number;
  position?: React.CSSProperties["position"];
  top?: React.CSSProperties["top"];
  right?: React.CSSProperties["right"];
  bottom?: React.CSSProperties["bottom"];
  left?: React.CSSProperties["left"];
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function TeamMember({
  imageSrc,
  name,
  role,
  location,
  width = 302,
  height = 302,
}: TeamMemberProps) {
  const { position, top, right, bottom, left, zIndex, className, style } =
    arguments[0] as TeamMemberProps;

  const positioningStyle: React.CSSProperties = {
    position,
    top,
    right,
    bottom,
    left,
    zIndex,
    ...style,
  };

  return (
    <motion.div
      className={`flex flex-col items-center justify-center gap-[12px] ${
        className ?? ""
      }`}
      style={positioningStyle}
      custom={0}
      variants={fadeInUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <Image
        src={imageSrc}
        alt={name}
        width={width}
        height={height}
        className="rounded-full shadow-lg aspect-square"
      />
      <div className="text-center">
        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">{name}</h3>
        <p className="text-sm sm:text-base text-gray-500">{role}</p>
        {location && (
          <p className="text-xs sm:text-sm md:text-base text-gray-400 mt-1">
            {location}
          </p>
        )}
      </div>
    </motion.div>
  );
}
