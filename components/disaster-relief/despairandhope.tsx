import { ArrowRight } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'

export default function DespairAndHope() {
  return (
    <div className='w-full h-auto flex flex-col lg:flex-row justify-center items-center px-6 lg:px-10 py-10 pb-12 gap-4'>
        <div className='w-full lg:w-3/4 h-auto flex flex-col justify-center items-start gap-6'>
            <p className='text-xs p-2 border rounded-full bg-[#FAFAFA] '>Powered by vetted, audited smart contracts. Withdraw anytime. Your funds remain yours — always.</p>
            <div className="text-left w-full text-2xl md:text-3xl lg:text-5xl font-bold">
                Be the Difference Between <br />
                <span className="text-gray-500">Despair and Hope </span>
            </div>
            <p className='text-lg text-gray-600'>Join RefreeG and make disaster relief faster, safer, and more impactful. Survivors are <br /> waiting.</p>
            <Button className='bg-[#FAFAFA] hover:bg-[#0A0A0B] hover:text-white border text-black px-10 py-4 flex items-center gap-2 rounded-full'>
                Get Started
                <ArrowRight size={16} />
            </Button>
        </div>
        <div className="w-full lg:w-1/4 h-auto flex justify-center items-center">
            <Image 
                src="/images/coinsearch.png" 
                alt="Grow Your Business" 
                width={600} 
                height={400} 
                className="w-full h-auto" 
            />
        </div>
    </div>
  )
}
