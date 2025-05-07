import React from "react";
import HowDoWeAchieveThis from "../OurMission/_components/HowDoWeAchieveThis";
import Hero from "./_components/hero";
import ByNumbers from "./_components/ByNumbers";
import ChangeLives from "./_components/ChangeLives";

export default function Impact() {
    return (
        <div className="w-full">
            <Hero />
            <ByNumbers />
            <HowDoWeAchieveThis />
            <ChangeLives />           
        </div>
    )
}