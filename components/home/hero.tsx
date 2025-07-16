import React from "react";
import Image from "next/image";
import { H1, P } from "@/components/typograpy";
import { Button } from "../ui/button";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      className="w-full min-h-[90vh] bg-background px-4 md:px-[50px] py-[15px] md:py-[25px] flex flex-col items-center justify-center"
      id="home"
    >
      <div className="flex flex-col gap-4 max-w-[925px] w-full justify-center items-center text-center">
        <div className="flex gap-2 items-center">
          <Image
            src={"/Users.svg"}
            alt="Group of users icon"
            width={20}
            height={20}
          />
          <P>Join thousands already fundraising on RefreeG</P>
        </div>

        <H1 className="font-bold">
          Empower Communities, Build a Better Africa
        </H1>

        <P className="font-light">
          Support causes that foster socioeconomic growth through transparent
          and secure crowdfunding
        </P>

        <div className="flex gap-4">
          <Button asChild className="px-3.5 py-2 bg-blue-700 text-white">
            <Link href="/causes">Explore Causes</Link>
          </Button>

          <Button
            asChild
            className="px-3.5 py-2 bg-white text-[#003366] border border-[#003366] hover:bg-white hover:text-[#003366] hover:border-[#003366]"
          >
            <Link href="/causes">
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
        </div>
      </div>
      <div>
        <div className="relative w-full bg-white overflow-hidden py-24">
          {/* Top Ellipse (pushing into the section from above) */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[1728px] h-36 bg-white rounded-full z-30"></div>

          {/* Bottom Ellipse (pushing into the section from below) */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[1728px] h-36 bg-white rounded-full z-30"></div>

          {/* Image Row */}
          <div className="relative z-10 flex justify-center gap-6 px-4">
            <img
              src="/hero1.png"
              alt="img1"
              className="w-[300px] h-[200px] object-cover rounded-xl shadow-lg"
            />
            <img
              src="/hero2.jpg"
              alt="img2"
              className="w-[300px] h-[200px] object-cover rounded-xl shadow-lg"
            />
            <img
              src="/hero3.png"
              alt="img3"
              className="w-[300px] h-[200px] object-cover rounded-xl shadow-lg"
            />
            <img
              src="/hero4.png"
              alt="img4"
              className="w-[300px] h-[200px] object-cover rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
