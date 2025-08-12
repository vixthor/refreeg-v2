import { FeaturedCauses } from "@/components/home/featured-causes";
import Hero from "@/components/home/hero";
import FAQ from "@/components/home/frequentlyAskedQuestions";
import AdBanner from "@/components/AdBanner";
import LaunchYourCauseInSeconds from "@/components/home/launchYourCauseInSeconds";
import { TrendingCauses } from "@/components/home/trendingNow";
import WhyItStandsOut from "@/components/home/whyitStandsOut";
import HowitWorksYT from "@/components/home/howitWorksYT";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen mt-16 mx-6 md:mx-12">
      <Hero />

      <LaunchYourCauseInSeconds />

      <TrendingCauses />

      <WhyItStandsOut />

      {/* Featured Causes */}
      <FeaturedCauses />

      <HowitWorksYT />

      <FAQ />
    </div>
  );
}
