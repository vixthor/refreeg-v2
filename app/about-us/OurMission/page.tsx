import React from "react";
import HowDoWeAchieveThis from "./_components/HowDoWeAchieveThis";
import WhatDoWeFocusOn from "./_components/WhatDoWeFocusOn";
import Hero from "./_components/hero";
import Whyweexist from "./_components/whyweexist";
import CreateBetterFuture from "./_components/CreateBetterFuture";
import AdBanner from "@/components/AdBanner";
export default function Mission() {
  return (
    <div className="w-full">
      <Hero />
      <Whyweexist />
      <div className="mt-16">
        <HowDoWeAchieveThis />
      </div>
      <WhatDoWeFocusOn />
      <CreateBetterFuture />
    </div>
  );
}
