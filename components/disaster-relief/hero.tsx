import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button' // optional if you’re using shadcn or your own button
import { Ul } from "@/components/typograpy";
import { FaArrowRight } from "react-icons/fa6";

export default function Hero() {
  return (
    <div className="relative w-full h-[380px] pt-16 flex justify-center text-white">
      {/* Main background image */}
      <Image
        src="/herodisaster.png"
        alt="disaster hero"
        fill
        className="object-fill"
        priority
      />

      {/* Overlay layer (optional gradient for readability) */}
      <div className="absolute inset-0 " />

      {/* Content layer */}
      <div className="relative z-10 text-black px-6">
        <div className='px-10 w-full flex flex-col-reverse md:flex md:flex-row justify-between'>
                <div className='w-full lg:w-8/12'>
                    <div className='w-full lg:w-5/6 mb-7'>
                        <div className='text-xl md:text-2xl lg:text-4xl font-semibold pb-2 md:pb-2 lg:mb-1'>When Disaster Strikes, <br /> Hope Should Arrive Faster</div>
                        <div className='text-sm md:text-base lg:text-lg'>
                            RefreeG empowers communities, NGOs, and relief organizations to raise urgent funds for disaster response. From floods to fires, donors can send help instantly in fiat or crypto — with transparent tracking and impact updates.
                        </div>
                    </div>
                    <Button className=" text-xs md:text-base flex items-center gap-x-2 text-white p-2 bg-[#151314] rounded">
                         Launch a Disaster Relief Campaign 
                         <Image src="/images/chevron-right-2.png" height={12} width={12} alt="get started" />
                    </Button>
                </div>
                <div className='hidden lg:block w-full md:w-4/12'>
                    <Image 
                        className='mx-auto md:ml-auto'
                        src={"/disaster.png"}
                        width={550}
                        height={500} 
                        alt='mission.png' 
                    />
                </div>
            </div>      
      </div>
    </div>
  )
}
