import React from 'react'
import { FaArrowRight } from "react-icons/fa6";
import Image from 'next/image';

export default function Hero() {
  return (
    <div className='px-10 w-full flex flex-col-reverse md:flex md:flex-row justify-between'>
        <div className='w-full lg:w-8/12'>
            <div className='w-full lg:w-5/6 mb-7'>
                <div className='text-2xl font-semibold pb-2 md:pb-4 lg:mb-7'>Our mission 🚀</div>
                <div className='text-sm md:text-base lg:text-lg'>At RefreeG, we believe in the power of community-driven change. 
                    Our mission is simple yet powerful: To connect those who want to help with those who need it the most. 
                    To create a transparent and accountable crowdfunding platform. 
                    To foster socio-economic growth by supporting impactful causes. 
                    We exist to empower individuals, businesses, and communities by providing a trustworthy platform where funds are securely donated and effectively utilized for meaningful change.
                </div>
            </div>
            <button className=" text-xs md:text-base flex items-center gap-x-2 text-white p-2 bg-[#0070E0] rounded">
                Crowdfund on Refreeg <FaArrowRight />
            </button>
        </div>
        <div className='hidden lg:block w-full md:w-4/12'>
            <Image 
                className='mx-auto md:ml-auto'
                src={"/mission.png"}
                width={450}
                height={400} 
                alt='mission.png' 
            />
        </div>
        
        <div></div>
    </div>
  )
}
