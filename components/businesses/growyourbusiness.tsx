import { ArrowRight } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'

export default function GrowYourBusiness() {
  return (
    <div className='w-full h-auto flex flex-col lg:flex-row justify-center items-center px-6 lg:px-10 py-10 gap-4'>
        <div className='w-full lg:w-3/4 h-auto flex flex-col justify-center items-start gap-6'>
            <p className='text-xs p-2 border rounded-full bg-[#FAFAFA] '>Powered by vetted, audited smart contracts. Withdraw anytime. Your funds remain yours — always.</p>
            <h1 className='text-4xl lg:text-5xl font-bold text-black leading-tight'>Ready to Grow Your Business?</h1>
            <p className='text-lg text-gray-600'>Join thousands of entrepreneurs using RefreeG to bring their vision to life.</p>
            <Button className='bg-[#FAFAFA] border text-black px-10 py-4 flex items-center gap-2 rounded-full'>
                Get Started
                <ArrowRight size={16} />
            </Button>
        </div>
        <div className="w-full lg:w-1/4 h-auto flex justify-center items-center">
            <Image 
                src="/dartcoin.png" 
                alt="Grow Your Business" 
                width={500} 
                height={300} 
                className="w-full h-auto" 
            />
        </div>
    </div>
  )
}
