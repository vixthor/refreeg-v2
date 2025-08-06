"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { H1, P } from "@/components/typograpy";
import { Button } from "../ui/button";
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";

// --- CONFIGURATION ---
const HERO_IMAGES = ["/hero1.png", "/hero2.jpg", "/hero3.png", "/hero4.png"];
const SLIDER_SPEED = 50; // seconds
const SLIDE_UP_DURATION = 0.6;
const IMAGE_GAP = 24; // corresponds to gap-6 in Tailwind

// --- ANIMATION HELPERS ---
const slideUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: SLIDE_UP_DURATION, delay },
});

const slideFrom = (x: number, delay = 0) => ({
  initial: { opacity: 0, x },
  animate: { opacity: 1, x: 0 },
  transition: { duration: SLIDE_UP_DURATION, delay },
});

// --- COMPONENT ---
const Hero = () => {
  const sliderControls = useAnimation();
  const imageControls = HERO_IMAGES.map(() => useAnimation());

  useEffect(() => {
    const runAnimation = async () => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      if (isMobile) {
        // All images appear together
        await Promise.all(
          imageControls.map((control) =>
            control.start({
              opacity: 1,
              y: 0,
              transition: { duration: SLIDE_UP_DURATION, ease: "easeOut" },
            })
          )
        );
      } else {
        // Sequential appearance
        for (let control of imageControls) {
          await control.start({
            opacity: 1,
            y: 0,
            transition: { duration: SLIDE_UP_DURATION, ease: "easeOut" },
          });
        }
      }

      // Use responsive animation based on screen size
      const mobileWidth = 200 + IMAGE_GAP;
      const desktopWidth = 325 + IMAGE_GAP;
      const totalWidth = isMobile
        ? HERO_IMAGES.length * mobileWidth
        : HERO_IMAGES.length * desktopWidth;

      sliderControls.start({
        x: -totalWidth,
        transition: {
          repeat: Infinity,
          repeatType: "loop",
          duration: SLIDER_SPEED,
          ease: "linear",
        },
      });
    };

    runAnimation();
  }, [imageControls, sliderControls]);

  return (
    <section
      className="w-full bg-background flex flex-col items-center justify-center mb-10"
      id="home"
    >
      {/* --- TEXT CONTENT --- */}
      <div className="flex flex-col gap-4 max-w-[925px] w-full justify-center items-center text-center">
        <motion.div className="flex gap-2 items-center" {...slideUp(0.1)}>
          <Image src="/Users.svg" alt="Users icon" width={20} height={20} />
          <P>Join thousands already fundraising on RefreeG</P>
        </motion.div>

        <motion.div {...slideUp(0.2)}>
          <H1 className="font-bold">
            Empower Communities, Build a Better World
          </H1>
        </motion.div>

        <motion.div {...slideUp(0.3)}>
          <P className="font-light">
            Support causes that foster socioeconomic growth through transparent
            and secure crowdfunding
          </P>
        </motion.div>

        <div className="flex gap-4">
          <motion.div {...slideFrom(-20, 0.4)}>
            <Button asChild className="px-3.5 py-2 bg-blue-700 text-white">
              <Link href="/causes">Explore Causes</Link>
            </Button>
          </motion.div>

          <motion.div {...slideFrom(20, 0.4)}>
            <Button
              asChild
              className="px-3.5 py-2 bg-white text-[#003366] border border-[#003366] hover:bg-white hover:text-[#003366]"
            >
              <Link href="/auth/signin">
                <span className="flex items-center gap-2">
                  Join the change
                  <Image
                    src="/images/arrow-up-right 1.svg"
                    alt="Join the change"
                    width={20}
                    height={20}
                  />
                </span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* --- IMAGE SLIDER --- */}
      <div className="relative w-full bg-white overflow-hidden py-12">
        <div className="relative z-10 w-full overflow-hidden">
          <motion.div
            className="flex gap-6 w-max"
            animate={sliderControls}
            initial={{ x: 0 }}
          >
            {[...HERO_IMAGES, ...HERO_IMAGES, ...HERO_IMAGES].map(
              (src, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 flex justify-center items-center w-[200px] h-[150px] md:w-[325px] md:h-[200px]"
                  initial={{ opacity: 0, y: 40 }}
                  animate={imageControls[index % HERO_IMAGES.length]}
                >
                  <img
                    src={src}
                    alt={`Hero image ${index + 1}`}
                    className="object-cover rounded-xl shadow-lg w-full h-full"
                  />
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
