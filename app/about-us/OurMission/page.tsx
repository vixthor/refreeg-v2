import React from "react";
import HowDoWeAchieveThis from "./_components/HowDoWeAchieveThis";
import WhatDoWeFocusOn from "./_components/WhatDoWeFocusOn";
import Hero from "./_components/hero";
import Whyweexist from "./_components/whyweexist";
import CreateBetterFuture from "./_components/CreateBetterFuture";
export default function Mission() {
    return (
        <div className="w-full">
            <Hero />
            <Whyweexist />
            <HowDoWeAchieveThis />
            <WhatDoWeFocusOn />
            <CreateBetterFuture />           
        </div>
    )
}