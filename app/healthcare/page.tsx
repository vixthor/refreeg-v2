import Hero from '@/components/healthcare/hero'
import React from 'react'
import Numbers from '@/components/numbers'
import MoreOnHealthcare from '@/components/healthcare/moreonhealthcare'
import HealthcareSupport from '@/components/healthcare/healthcaresupport'
import HowItWorks from '@/components/healthcare/howitworks'
import HopeTransparency from '@/components/healthcare/transparencyforhope'
import LifeMatters from '@/components/healthcare/lifematters'

export default function Healthcare() {
  return (
    <div className='space-y-10'>
        <Hero />
        <Numbers />
        <MoreOnHealthcare />
        <HealthcareSupport />
        <HowItWorks />
        <HopeTransparency />
        <LifeMatters />
    </div>
  )
}
