import React from "react";
import Hero from "./components/hero";
import TrustSection from "./components/TrustSection";
import FeaturesSection from "./components/FeaturesSection";

const NonProfitsPage = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <TrustSection />
      <FeaturesSection />
    </div>
  );
};

export default NonProfitsPage;