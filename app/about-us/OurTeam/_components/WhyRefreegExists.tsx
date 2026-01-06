"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.2, ease: "easeOut" as any },
  }),
};

type Props = {
  title?: string;
  ctaText?: string;
  ctaHref?: string;
};

const DEFAULT_TITLE =
  "RefreeG was created by a small team who saw how hard it can be to raise support for ideas, projects, or urgent needs. Traditional fundraising often felt limited, complicated, or out of reach. RefreeG is our way of making crowdfunding easier, transparent, and reliable for everyone.";

export default function WhyRefreegExists({
  title = DEFAULT_TITLE,
  ctaText = "Get started today",
  ctaHref = "/causes",
}: Props) {
  return (
    <section className="w-full px-4 md:px-8 lg:px-16 my-10">
      <motion.div
        className="bg-[#0C4A85] text-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 lg:p-14 shadow-sm"
        custom={0}
        variants={fadeInUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
      >
        <motion.p
          className="text-sm md:text-base font-medium opacity-90 mb-3"
          custom={1}
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          Why RefreeG Exists
        </motion.p>
        <motion.h2
          className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl leading-tight font-bold tracking-tight"
          custom={2}
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {title}
        </motion.h2>
        <motion.div
          className="mt-6"
          custom={3}
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 underline underline-offset-4"
            >
              {ctaText}
              <span aria-hidden>›</span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
