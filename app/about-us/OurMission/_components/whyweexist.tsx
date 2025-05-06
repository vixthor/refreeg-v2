// import Image from 'next/image'
import React from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { FC } from "react";

interface FeatureCardProps {
  imageSrc: string;
  title: string;
  description: string;
}

export const FeatureCard: FC<FeatureCardProps> = ({
  imageSrc,
  title,
  description,
}) => (
  <div className="w-full">
    <div className="w-10/12 flex items-center space-x-4">
      <Image
        src={imageSrc}
        alt="icon"
        width={70}
        height={70}
        className="border p-2 rounded-full aspect-square object-cover bg-[#FAFAFA] "
      />
      <div className="space-y-1 md:space-y-0">
        <h2 className="text-sm md:text-base lg:text-xl font-medium">{title}</h2>
        <p className="text-xs md:text-sm lg:text-base">{description}</p>
      </div>
    </div>
  </div>
);

export default function Whyweexist() {
  return (
    <div className="w-full px-6 md:px-10 mt-4 lg:mt-24">
      <div className="w-full flex justify-center">
        <Image
          draggable="false"
          src="/team.JPG"
          alt="RefreeG Team"
          width={600}
          height={400}
          className="w-full max-w-md md:max-w-2xl h-auto object-cover rounded-lg"
        />
      </div>
      <div className="mt-16 lg:mt-24">
        <div>
          <div className="text-xl md:text-2xl font-semibold">
            Why do we exist?
          </div>
          <div className="text-xs md:text-base lg:text-lg">
            We exist to be your go to risk free crowdfunding platform
          </div>
        </div>
        <div className="space-y-2 md:flex justify-between mt-4">
          <FeatureCard
            imageSrc={"/images/no-yelling.png"}
            title="Lack of Transparency"
            description="Donors struggle to see where their money goes."
          />
          <FeatureCard
            imageSrc={"/images/access-denied.png"}
            title="Limited Access"
            description="Many crowdfunding sites don’t focus on grassroots impact."
          />
          <FeatureCard
            imageSrc={"/images/fence.png"}
            title="High Barriers for Local Fundraisers"
            description="Donors struggle to see where their money goes."
          />
        </div>
      </div>
    </div>
  );
}
