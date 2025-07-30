"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { H1, P } from "@/components/typograpy";
import { Button } from "../ui/button";
import Link from "next/link";
import { motion, useAnimation, AnimationControls } from "framer-motion";

// --- CONFIGURATION ---
const HERO_IMAGES = ["/hero1.png", "/hero2.jpg", "/hero3.png", "/hero4.png"];
const SLIDER_SPEED = 70; // seconds for infinite loop
const IMAGE_SIZE = { width: 300, height: 200 };
const SLIDE_UP_DURATION = 0.6;
const IMAGE_GAP = 24; // 6 * 4px (gap-6 in Tailwind)

// --- ANIMATION VARIANTS ---
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

// --- HERO COMPONENT ---
const Hero = () => {
  const sliderControls = useAnimation();
  const imageControls: AnimationControls[] = HERO_IMAGES.map(() =>
    useAnimation()
  );

  // Sequential image slide-up, then start horizontal slider
  useEffect(() => {
    const runAnimation = async () => {
      // First, animate images sliding up
      for (let control of imageControls) {
        await control.start({
          opacity: 1,
          y: 0,
          transition: { duration: SLIDE_UP_DURATION, ease: "easeOut" },
        });
      }

      // Calculate the total width of one set of images
      const totalWidth = HERO_IMAGES.length * (IMAGE_SIZE.width + IMAGE_GAP);

      // Start infinite horizontal scroll
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
      className="w-full bg-background flex flex-col items-center justify-center"
      id="home"
    >
      {/* HERO TEXT */}
      <div className="flex flex-col gap-4 max-w-[925px] w-full justify-center items-center text-center">
        <motion.div className="flex gap-2 items-center" {...slideUp(0.1)}>
          <Image
            src="/Users.svg"
            alt="Group of users icon"
            width={20}
            height={20}
          />
          <P>Join thousands already fundraising on RefreeG</P>
        </motion.div>

        <motion.div {...slideUp(0.2)}>
          <H1 className="font-bold">
            Empower Communities, Build a Better Africa
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
              className="px-3.5 py-2 bg-white text-[#003366] border border-[#003366] hover:bg-white hover:text-[#003366] hover:border-[#003366]"
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

      {/* SLIDER SECTION */}
      <div className="relative w-full bg-white overflow-hidden py-12">
        {/* Infinite Scrolling Images */}
        <div className="relative z-10 w-full overflow-hidden">
          <motion.div
            className="flex gap-6 w-max"
            animate={sliderControls}
            initial={{ x: 0 }}
          >
            {/* Triple the images for seamless looping */}
            {[...HERO_IMAGES, ...HERO_IMAGES, ...HERO_IMAGES].map(
              (src, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 flex justify-center items-center"
                  style={{ width: IMAGE_SIZE.width, height: IMAGE_SIZE.height }}
                  initial={{ opacity: 0, y: 40 }}
                  animate={imageControls[index % HERO_IMAGES.length]}
                >
                  <img
                    src={src}
                    alt={`Hero image ${(index % HERO_IMAGES.length) + 1}`}
                    className="object-cover rounded-xl shadow-lg"
                    style={IMAGE_SIZE}
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
