import React from 'react'
import Hero from '@/components/disaster-relief/hero'
import Numbers from '@/components/numbers'
import HowItWorks from '@/components/disaster-relief/howitworks'
import DespairAndHope from '@/components/disaster-relief/despairandhope'
import ReliefPowered from '@/components/disaster-relief/reliefpowered'

export default function DisasterRelief() {
  return (
    <div className='space-y-10'>
        <Hero />
        <Numbers />
        <ReliefPowered />
        <HowItWorks />
        <DespairAndHope />
    </div>
  )
}
