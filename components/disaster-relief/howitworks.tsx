import React from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'

export default function HowItWorks() {
  return (
    <div className='w-full h-auto text-black flex flex-col px-6 lg:px-10 py-10 gap-6'>

      {/* Headings (centered) */}
      <div className="text-center w-full text-2xl md:text-3xl lg:text-5xl font-bold">
        How It {" "}
        <span className="text-gray-500">Works!</span>
      </div>

      <div className="text-center w-full mx-auto text-gray-600">
        From Need to Care, Faster.
      </div>

      {/* Numbers (stacked on separate lines, aligned differently) */}
      <div className="w-full flex flex-col gap-16 mb-12 text-lg">
        <div className="self-start text-left">
            <div className="w-fit border px-4 py-1.5 mb-4 rounded-full bg-[#0A0A0B] text-white">
            1
            </div>
            <div className='font-bold'>Create a Relief Campaign</div>
            <div>
                Share the disaster details and urgent <br /> 
                needs.
            </div>
        </div>

        <div className="self-center text-left">
            <div className="w-fit border px-4 py-2 mb-4 rounded-full bg-[#0A0A0B] text-white">
            2
            </div>
            <div className='font-bold'>Verify for Trust</div>
            <div>
            Build donor confidence with KYC and <br /> cause verification.
            </div>
        </div>

        <div className="self-end text-left">
            <div className="w-fit border px-4 py-2 mb-4 rounded-full bg-[#0A0A0B] text-white">
            3
            </div>
            <div className='font-bold'>Receive Donations Instantly</div>
            <div>
            Secure funding globally in multiple  <br /> currencies.
            </div>
        </div>

        <div className="self-start text-left">
            <div className="w-fit border px-4 py-2 mb-4 rounded-full bg-[#0A0A0B] text-white">
            4
            </div>
            <div className='font-bold'>Deliver Updates</div>
            <div>
            Show proof of aid with images, videos,  <br /> and on-ground reports.
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
