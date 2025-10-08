import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button' // optional if you’re using shadcn or your own button

export default function Hero() {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center text-white overflow-hidden">
      {/* Blurred background image */}
      <div className="absolute inset-0">
        <Image
          src="/healthcarehero.png"
          alt="healthcare hero"
          fill
          className="object-cover scale-110"
          priority
        />
        {/* Optional overlay for contrast */}
        <div className="absolute inset-0" />
      </div>

      {/* Content layer (sharp) */}
      <div className="relative z-10 text-center text-black max-w-3xl px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Fund Hope. Save Lives.
        </h1>
        <p className="text-lg md:text-xl mb-6">
          RefreeG empowers hospitals, clinics, and healthcare 
          nonprofits to raise funds transparently for treatments, 
          equipment, and emergency response. Donors can give in 
          fiat or crypto, track impact, and even earn yield while 
          saving lives.
        </p>
        <Button className="bg-[#C03744] hover:bg-[#a72f3b] text-white px-12 py-3 rounded-sm flex items-center justify-center mx-auto">
          Start a Healthcare Campaign
          <Image 
            src="/images/chevron-right-2.png" 
            height={20} 
            width={20} 
            alt="get started" 
            className="ml-2" 
          />
        </Button>      
      </div>
    </div>
  )
}
