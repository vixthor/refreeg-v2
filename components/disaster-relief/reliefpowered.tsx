import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";

export default function ReliefPowered() {
  const features = [
    {
      title: "Instant Global Donations",
      desc: "Raise and deploy funds worldwide within minutes, not days.",
      image: "/images/conflict.png",
    },
    {
      title: "Multi-Currency Support",
      desc: "Accept donations in fiat, crypto, or stablecoins — no barriers, no delays.",
      image: "/images/cardwallet.png",
    },
    {
      title: "Verified Distribution",
      desc: "Track every donation to ensure supplies, shelter, and aid reach survivors.",
      image: "/images/openbox.png",
    },
    {
      title: "Yield for Long-Term Recovery",
      desc: "Earn sustainable yields on relief funds to rebuild communities after the emergency.",
      image: "/images/statscoin.png",
    },
  ];

  return (
    <div className="w-full h-auto px-6 md:px-0 mt-16">
      {/* Header */}
      <div className="text-center w-full text-2xl md:text-3xl lg:text-5xl font-bold mb-12">
        Relief Powered by {" "}
        <span className="text-gray-500">RefreeG</span>
        <p className="text-sm md:text-base lg:text-lg font-normal"> From Crisis to Care all In One Platform.</p>
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
            <Button className="w-2/3 bg-[#151314] hover:bg-[#2f2b2d] border px-10 py-6 flex items-center justify-center gap-2 rounded-full shadow">
              <Image
                src="/images/doctorsbag.png"
                height={20}
                width={20}
                alt="get started"
              />
              Start a Disaster Relief Campaign
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
