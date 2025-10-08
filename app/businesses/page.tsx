import React from 'react'
import GrowYourBusiness from '@/components/businesses/growyourbusiness'
import MoreOnBusiness from '@/components/businesses/moreonbusiness'
import AllYouNeed from '@/components/businesses/allyouneed'
import SmartCrowdfund from '@/components/businesses/smartcrowdfund'
import Numbers from '@/components/numbers'
import Hero from '@/components/businesses/hero'

export default function Business() {
  return (
    <div>
        <Hero />
        <Numbers />
        <SmartCrowdfund />
        <AllYouNeed />
        <MoreOnBusiness />
        <GrowYourBusiness />
    </div>
  )
}
