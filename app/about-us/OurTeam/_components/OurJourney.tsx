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
    title: 'The Idea',
    description:
      'We realized that too many people with great ideas or urgent needs lacked access to fair and effective funding opportunities.',
  },
  {
    number: 2,
    title: 'The Build',
    description:
      'A small, passionate team came together to design RefreeG, with trust, simplicity, and community at its core.',
  },
  {
    number: 3,
    title: 'The Launch',
    description:
      'After months of dedication, we launched RefreeG to give anyone the chance to bring their ideas and causes to life.',
  },
  {
    number: 4,
    title: 'The Future',
    description:
      'We’re building towards a global platform where opportunities, impact, and support can be shared without limits.',
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
