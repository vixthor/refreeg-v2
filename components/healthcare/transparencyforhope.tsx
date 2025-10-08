import React from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'

export default function HopeTransparency() {
  return (
    <div className='w-full h-auto text-black flex flex-col px-6 lg:px-10 py-10 gap-6'>

      {/* Headings (centered) */}
      <div className="text-center w-full text-2xl md:text-3xl lg:text-5xl font-bold">
        Transparency That {" "}
        <span className="text-gray-500">Builds Hope</span>
      </div>

      <div className="text-center w-full mx-auto text-gray-600">
        Because Donors Deserve Proof. Patients Deserve Trust.
      </div>

      <Image 
        src="/healthmap.png" 
        alt="Transparency That Builds Hope"
        width={800} 
        height={400} 
        className="w-full h-auto mx-auto"
      />

      
    </div>
  )
}
