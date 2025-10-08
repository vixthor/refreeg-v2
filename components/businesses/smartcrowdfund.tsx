import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";

export default function SmartCrowdfund() {
  const features = [
    {
      title: "Raise Startup Capital",
      desc: "Kickstart your idea with funds from your network and beyond. Share your vision, attract early supporters, and validate your market.",
      image: "/images/raisecoin.png",
    },
    {
      title: "Scale with Transparency",
      desc: "Showcase updates, milestones, and real-time progress to build trust and encourage repeat contributions from your community.",
      image: "/images/searchcoin.png",
    },
    {
      title: "Multi-Currency Flexibility",
      desc: "Accept contributions in multiple fiat and crypto wallets, making it easy for investors and supporters worldwide to back you.",
      image: "/images/globalcoin.png",
    },
    {
      title: "Grow with Yield",
      desc: "Don’t just raise funds—make them work. Stake your raised capital in our liquidity pool to earn a yield while you plan and execute your growth.",
      image: "/images/statscoin.png",
    },
  ];

  return (
    <div className="w-full h-auto px-6 md:px-0 mt-16">
      {/* Header */}
      <div className="text-center w-full text-2xl md:text-3xl lg:text-5xl font-bold mb-12">
        Smart Crowdfunding, Built for <br />
        <span className="text-gray-500">Entrepreneurs</span>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-start gap-4 p-6 rounded-2xl border shadow-sm bg-white"
          >
            <Image src={item.image} width={60} height={60} alt={item.title} />
            <p className="font-semibold text-lg">{item.title}</p>
            <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}

        {/* Last row */}
        <div className="flex flex-col gap-8 md:col-span-3 md:flex-row">
          {/* Last card */}
          <div className="flex flex-col border items-start gap-4 p-6 rounded-2xl shadow-sm bg-white md:w-1/3">
            <Image
              src={features[3].image}
              width={60}
              height={60}
              alt={features[3].title}
            />
            <p className="font-semibold text-lg">{features[3].title}</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              {features[3].desc}
            </p>
          </div>

          {/* Button fills remaining space */}
          <div className="flex justify-center items-center w-full md:w-2/3">
            <Button className="w-2/3 bg-[#1FC16B] hover:bg-[#1fb867] border px-10 py-6 flex items-center justify-center gap-2 rounded-full shadow">
              <Image
                src="/briefcase.png"
                height={20}
                width={20}
                alt="get started"
              />
              Start a Business Campaign
              <Image
                src="/images/arrow-right-1.png"
                height={20}
                width={20}
                alt="get started"
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
