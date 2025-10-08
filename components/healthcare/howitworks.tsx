import React from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'

export default function HowItWorks() {
  return (
    <div className='w-full h-auto text-black flex flex-col px-6 lg:px-10 py-10 gap-6'>

      {/* Headings (centered) */}
      <div className="text-center w-full text-2xl md:text-3xl lg:text-5xl font-bold">
        Everything You Need, All in One <br /> 
        <span className="text-gray-500">Place</span>
      </div>

      <div className="text-center w-full mx-auto text-gray-600">
        Raise funds, protect your supporters, and grow your capital 
        with features made for forward-thinking entrepreneurs.
      </div>

      {/* Numbers (stacked on separate lines, aligned differently) */}
      <div className="w-full flex flex-col gap-16 mb-12 text-lg">
        <div className="self-start text-left">
            <div className="w-fit border px-4 py-1.5 mb-4 rounded-full bg-[#8C1823] text-white">
            1
            </div>
            <div className='font-bold'>Create Your Campaign</div>
            <div>
                Share your patient story, hospital <br /> 
                need, or healthcare mission.
            </div>
        </div>

        <div className="self-center text-left">
            <div className="w-fit border px-4 py-2 mb-4 rounded-full bg-[#8C1823] text-white">
            2
            </div>
            <div className='font-bold'>Verify for Trust</div>
            <div>
            Build donor confidence through RefreeG’s <br /> secure KYC and compliance.
            </div>
        </div>

        <div className="self-end text-left">
            <div className="w-fit border px-4 py-2 mb-4 rounded-full bg-[#8C1823] text-white">
            3
            </div>
            <div className='font-bold'>Raise Funds Globally</div>
            <div>
            Accept multi-currency donations, from <br /> fiat to crypto.
            </div>
        </div>

        <div className="self-start text-left">
            <div className="w-fit border px-4 py-2 mb-4 rounded-full bg-[#8C1823] text-white">
            4
            </div>
            <div className='font-bold'>Deliver Proof</div>
            <div>
            Post recovery updates, medical reports, <br /> and photos to donors in real-time.
            </div>
        </div>
      </div>



      {/* Button (aligned left) */}
      <div className="w-full flex justify-start">
        <Button className='bg-[#FAFAFA] border text-black px-10 py-4 flex items-center gap-2 rounded-full'>
          Get Started
          <Image src="/images/arrow-right.png" height={20} width={20} alt="get started" />
        </Button>
      </div>
    </div>
  )
}
