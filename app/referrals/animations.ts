// app/referrals/animations.ts
import type { Variants } from "framer-motion";

// Section entrance
export const sectionVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

// Generic fade-up
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// Stagger children
export const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

// Soft hover for icons / cards
export const hoverSoft: Variants = {
  rest: { scale: 1, y: 0, transition: { duration: 0.2 } },
  hover: { scale: 1.03, y: -4, transition: { duration: 0.25 } },
};

// Mobile hover (slightly less movement)
export const mobileHover: Variants = {
  rest: { scale: 1, y: 0, transition: { duration: 0.2 } },
  hover: { scale: 1.02, y: -3, transition: { duration: 0.25 } },
};

// Gentle floating for icons
export const floating = {
  animate: {
    y: [0, -3, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Horizontal line grow
export const lineGrow: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Table row
export const rowVariant: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};
