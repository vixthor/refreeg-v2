import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeaturedCauses } from "@/components/featured-causes"
import Hero from "@/components/home/hero"
import WhyUseUs from "@/components/home/whyUseUs"
import { H2, P, Ol } from "@/components/typograpy";
import YouTubeEmbed from "@/components/YoutubeEmbed";
import TransparencyEnsurance from "@/components/home/transparencyEnsurance"
import CausesSupported from "@/components/home/causesWeSupport"
import FAQ from "@/components/home/frequentlyAskedQuestions"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen mt-16">
      <Hero />

      <WhyUseUs />

      <section>
        <div className="pt-2 px-10 pb-8 mb-8">
          <H2 className="mt-8 font-semibold text-2xl">How it works</H2>
          <P className="text-xl mb-12">
            How donation on{" "}
            <Link
              href="https://www.refreeg.com"
              className="text-gray-500 text-xl font-semibold underline"
            >
              Refreeg
            </Link>{" "}
            works!
          </P>

          <div className="relative aspect-video w-full max-w-4xl mx-auto">
            <YouTubeEmbed
              videoId="lzAJXX99ew0"
              title="How Refreeg donations work"
              className="my-8"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Refreeg makes it easy to create and support causes that matter to you.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3 md:gap-8">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                1
              </div>
              <h3 className="text-xl font-bold">Create a Cause</h3>
              <p className="text-center text-muted-foreground">
                Sign up and create a cause with details about your initiative and funding goal.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                2
              </div>
              <h3 className="text-xl font-bold">Get Approved</h3>
              <p className="text-center text-muted-foreground">
                Our team reviews your cause to ensure it meets our community guidelines.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                3
              </div>
              <h3 className="text-xl font-bold">Receive Donations</h3>
              <p className="text-center text-muted-foreground">
                Once approved, your cause goes live and donations are automatically transferred to your account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Causes */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Causes</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discover and support these impactful initiatives.
              </p>
            </div>
          </div>
          <FeaturedCauses />
          <div className="flex justify-center mt-8">
            <Link href="/causes">
              <Button variant="outline" size="lg">
                View All Causes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <TransparencyEnsurance />

      <CausesSupported />

      <FAQ />
    </div>
  )
}

