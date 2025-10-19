"use client";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa6";

export default function MoreThanCrowdfunding() {
  return (
      <section className="w-full px-4 md:px-8 lg:px-16 py-16 md:py-20 container">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16">
        {/* Left: Text */}
        <div>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200 text-gray-700 text-xs md:text-sm mb-6">
            Powered by vetted, audited smart contracts. Withdraw anytime. Your funds remain yours — always.
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            RefreeG is More than Just
            <br className="hidden md:block" /> a Crowdfunding Website
          </h2>
          <p className="mt-4 md:mt-6 text-base md:text-lg text-slate-600">
            Don’t wait. Start your cause today and turn support into real impact.
          </p>
          <div className="mt-8">
            <button className="inline-flex items-center gap-3 rounded-xl bg-white text-slate-900 px-6 py-3 text-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              Get started <FaArrowRight />
            </button>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-[460px] max-w-full aspect-[1.3/1]">
            <Image
              src="/impact.png"
              alt="Impact illustration"
              fill
              priority={false}
              sizes="(max-width: 1024px) 100vw, 460px"
              className="object-contain drop-shadow-[0_20px_50px_rgba(16,24,40,0.15)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
