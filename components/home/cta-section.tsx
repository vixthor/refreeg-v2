"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAnimateInView } from "@/hooks/use-animate-In-view";

export default function CTASection() {
  const { ref, isInView } = useAnimateInView();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ ease: [0.6, -0.05, 0.01, 0.99], duration: 0.8 }}
      className="mt-12 flex flex-col items-center w-10/12 lg:w-8/12 mx-auto rounded-3xl text-secondary-foreground px-10 py-10 mb-16 bg-secondary"
    >
      <div className="text-lg lg:text-3xl font-semibold mb-6">
        Ready to be part of the solution?
      </div>
      <div className="w-11/12 text-center text-base lg:text-lg mb-6">
        Join the RefreeG community and become a RefreeGerian today! By joining
        us, you contribute to empowering less privileged individuals in African
        communities, supporting causes that foster socio-economic growth, and
        promoting sustainable development. Together, we can make a significant
        impact and create a brighter future for all.
      </div>
      <Link
        href="https://t.me/+d67UCIer8c01ODhk"
        target="_blank"
        rel="noopener noreferrer"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex border rounded-md px-3 py-3 font-semibold hover:bg-gray-300 transition delay-150 bg-white text-blue-900"
        >
          Join our community
        </motion.button>
      </Link>
    </motion.div>
  );
}
