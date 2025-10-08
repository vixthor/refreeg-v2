import Image from "next/image";
import React from "react";

export default function StatsSection() {
  const stats = [
    {
      img: "/profile.png",
      alt: "profile",
      label: "Registered Donors",
      value: "1,000+",
    },
    {
      img: "/cash.png",
      alt: "cash",
      label: "Donated",
      value: "$2,000+",
    },
    {
      img: "/forms.png",
      alt: "forms",
      label: "Petition Signatures",
      value: "1,000+",
    },
  ];

  return (
    <div className="w-full h-auto text-black flex flex-col md:flex-row justify-around items-center px-6 lg:px-3 py-12">
      {stats.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center gap-3 md:gap-4"
        >
          <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-md">
            <Image src={item.img} alt={item.alt} width={60} height={60} />
          </div>
          <div className="text-2xl font-bold text-[#003E25]">{item.value}</div>
          <div className="text-gray-600 font-medium text-sm md:text-base">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
