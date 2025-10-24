"use client";

import Image from 'next/image'
import { motion } from "framer-motion";
import SectionHeader from './SectionHeader';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.2, ease: "easeOut" as any },
  }),
};

type Step = {
  number: number
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Where it began',
    description:
      'We recognized the barriers in traditional fundraising and set out to build a simpler, more transparent path.',
  },
  {
    number: 2,
    title: 'Building trust',
    description:
      'We focused on verification, clarity, and community—making it easy for supporters to see their impact.',
  },
  {
    number: 3,
    title: 'Scaling support',
    description:
      'From individuals to organizations, we expanded tools that help campaigns grow safely and effectively.',
  },
  {
    number: 4,
    title: 'The movement today',
    description:
      'RefreeG continues to empower change-makers with reliable, accessible crowdfunding for real impact.',
  },
]

export default function OurJourney() {
  return (
      <section className="w-full px-4 md:px-8 lg:px-16 my-16 container">
      <SectionHeader
        title="Our Journey"
        subtitle="The milestones that shaped RefreeG into what it is today."
        align="center"
        className='mb-6 gap-[15px]'
        titleClassName="text-3xl md:text-5xl"
        subtitleClassName="text-gray-500 "
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Image on the left */}
        <motion.div 
          className="lg:col-span-7"
          custom={2}
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <div className="relative w-full h-[420px] md:h-[520px] rounded-3xl overflow-hidden">
                      <Image src="/team.jpg" alt="Journey" fill className="object-cover" />
          </div>
        </motion.div>

        {/* Steps on the right */}
        <div className="lg:col-span-5 flex flex-col my-auto gap-6 lg:pl-6">
          {steps.map((step, index) => (
            <motion.div 
              key={step.number} 
              className="flex items-start gap-4"
              custom={3 + index}
              variants={fadeInUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border flex-shrink-0 ${index === 0 ? 'bg-[#0C0C0C] text-white border-gray-700' : 'bg-white text-gray-800 border border-gray-200'}`}>
                {step.number}
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold">{step.title}</h3>
                <p className="text-sm md:text-base text-gray-600 mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
