import React from "react";
import HowDoWeAchieveThis from "../OurMission/_components/HowDoWeAchieveThis";
import Hero from "./_components/hero";
import WhoWeAre from "./_components/whoweare";
import WhyRefreegExists from "./_components/WhyRefreegExists";
import OurJourney from "./_components/OurJourney";
import ImpactHighlights from "./_components/ImpactHighlights";
import MoreThanCrowdfunding from "./_components/MoreThanCrowdfunding";


export default function WhatWeDo() {
    return (
        <div className="w-full">
            <Hero />
            <ImpactHighlights />
            <WhoWeAre/>
            <WhyRefreegExists/>
            <OurJourney/>
            <MoreThanCrowdfunding />
        </div>
    )
}