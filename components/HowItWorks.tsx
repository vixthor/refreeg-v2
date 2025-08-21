"use client";

// import { Metadata } from "next";
import Image from "next/image";
import { useState } from "react";
import { Users2, Gift, Megaphone, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import WhyRefreeG from "@/components/WhyRefreeG";

// export const metadata: Metadata = {
//   title: "How It Works | Refreeg",
//   description:
//     "Learn how Refreeg connects donors with cause creators through our secure donation platform.",
// };

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState("general");

  const faqData = {
    general: [
      {
        id: "what-is-refreeg",
        question: "What is RefreeG?",
        icon: "●",
        iconColor: "text-blue-600",
        answer:
          "RefreeG is a crowdfunding platform dedicated to supporting various causes, with a strong focus on fostering socio-economic growth in African communities through blockchain transparency.",
      },
      {
        id: "transparency",
        question: "How does RefreeG ensure transparency?",
        icon: "♡",
        iconColor: "text-gray-300",
        answer:
          "We use blockchain technology to ensure complete transparency in all transactions. Every donation is tracked and can be verified on the blockchain, providing donors with full visibility into how their contributions are used.",
      },
      {
        id: "types-of-causes",
        question: "What types of causes does RefreeG support?",
        icon: "📄",
        iconColor: "text-gray-300",
        answer:
          "RefreeG supports a wide variety of causes including education, healthcare, community development, environmental initiatives, disaster relief, and social justice projects across African communities.",
      },
      {
        id: "get-involved",
        question: "How can I get involved with RefreeG?",
        icon: "🔍",
        iconColor: "text-gray-300",
        answer:
          "You can get involved by creating a cause, donating to existing causes, sharing campaigns on social media, or volunteering your skills to help cause creators succeed.",
      },
      {
        id: "different-platforms",
        question:
          "What makes RefreeG different from other crowdfunding platforms?",
        icon: "📊",
        iconColor: "text-gray-300",
        answer:
          "RefreeG focuses specifically on African communities, uses blockchain for transparency, charges no platform fees for cause creators, and provides additional tools for community engagement and impact tracking.",
      },
    ],
    features: [
      {
        id: "blockchain-tech",
        question: "How does blockchain technology work on RefreeG?",
        icon: "⛓️",
        iconColor: "text-gray-300",
        answer:
          "Our blockchain integration ensures every transaction is recorded immutably, providing complete transparency and accountability for all donations and fund usage.",
      },
      {
        id: "payment-methods",
        question: "What payment methods do you accept?",
        icon: "💳",
        iconColor: "text-gray-300",
        answer:
          "We accept various payment methods including credit/debit cards, bank transfers, mobile money, and cryptocurrency payments through our secure payment partners.",
      },
      {
        id: "mobile-app",
        question: "Do you have a mobile app?",
        icon: "📱",
        iconColor: "text-gray-300",
        answer:
          "Yes, RefreeG is available as a mobile app on both iOS and Android platforms, making it easy to create, manage, and donate to causes on the go.",
      },
    ],
    resources: [
      {
        id: "getting-started",
        question: "How do I get started with creating a cause?",
        icon: "🚀",
        iconColor: "text-gray-300",
        answer:
          "Simply sign up for an account, complete your profile verification, and use our step-by-step cause creation wizard to set up your fundraising campaign.",
      },
      {
        id: "support-resources",
        question: "What support resources are available?",
        icon: "📚",
        iconColor: "text-gray-300",
        answer:
          "We provide comprehensive guides, video tutorials, webinars, and dedicated customer support to help you succeed with your fundraising efforts.",
      },
      {
        id: "success-tips",
        question: "What are some tips for a successful campaign?",
        icon: "💡",
        iconColor: "text-gray-300",
        answer:
          "Key success factors include compelling storytelling, regular updates, engaging visuals, clear goals, and active promotion through social networks and community engagement.",
      },
    ],
  };
  const steps = [
    {
      title: "Create a Cause",
      description:
        "Cause creators can easily set up their fundraising campaigns on our platform, sharing their story and goals.",
      image: "/images/create-cause.svg",
    },
    {
      title: "Secure Donations",
      description:
        "Donors can contribute to causes they care about through our secure Paystack payment integration.",
      image: "/images/secure-donation.svg",
    },
    {
      title: "Direct Transfer",
      description:
        "We don't hold the funds - Paystack directly transfers donations to the cause creators' accounts.",
      image: "/images/direct-transfer.svg",
    },
    {
      title: "Transparent Process",
      description:
        "Every transaction is transparent and secure, with donors receiving confirmation of their contributions.",
      image: "/images/transparent.svg",
    },
  ];

  return (
    <div className="w-full">
      <div className="container py-12 relative flex flex-col">
        <div className="flex flex-col items-center mb-10">
          <button className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#FAFAFA] border text-gray-700 text-sm font-semibold mb-4">
            <Users2 className="w-5 h-5" />
            Learn how to fundraise on RefreeG
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            How RefreeG helps you support real <br /> causes
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-2xl mb-6">
            Refreeg is a cause-based platform that lets anyone start, support,
            or amplify meaningful initiatives — all for free, with full
            transparency and real impact.
          </p>
          <a
            href="/causes/create"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          >
            Start a cause
          </a>
        </div>

        <div className="w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-lg mb-10">
          <Image
            src="/peace.png"
            alt="Peace sign demo"
            width={1200}
            height={900}
            className="w-full aspect-[16/10] object-cover object-center rounded-3xl"
            priority
          />
        </div>
      </div>

      {/* Banner */}
      <div className="w-full bg-[#6EA3DB] py-10 flex justify-center items-center mb-8">
        <div className="flex flex-row gap-16 w-full max-w-4xl justify-center">
          <div className="flex items-center gap-2 text-white text-md">
            <Gift />
            No cost to start a cause
          </div>
          <div className="flex items-center gap-2 text-white text-md">
            <Megaphone />
            No cost to start a cause
          </div>
          <div className="flex items-center gap-2 text-white text-md">
            <Globe />
            No cost to start a cause
          </div>
        </div>
      </div>

      <WhyRefreeG />

      {/* Informational dark section (matches screenshot) */}
      <section className="w-full bg-[#323F49] text-slate-100 py-12">
        <div className="container px-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            RefreeG makes job referrals simple, rewarding, and transparent.
          </h2>

          <div className="space-y-3 text-sm md:text-base text-slate-300 leading-relaxed">
            <p>
              Getting referred for a job shouldn't depend on who you know or how
              lucky you are. With RefreeG, you can confidently request referrals
              from real employees and professionals who are open to helping,
              while{" "}
              <a className="underline text-slate-100" href="#">
                rewarding them for their time and effort
              </a>
              .
            </p>

            <p>
              Whether you're a recent graduate, a jobseeker breaking into a new
              industry, or a working professional looking for better
              opportunities, RefreeG opens the door to{" "}
              <a className="underline text-slate-100" href="#">
                career-changing connections
              </a>
              . And if you're on the other side — someone who accepts a memo to
              jobs and networks — RefreeG makes it easy to
              <a className="underline text-slate-100" href="#">
                {" "}
                support others and earn from it
              </a>
              .
            </p>

            <p>
              We believe referrals should be{" "}
              <a className="underline text-slate-100" href="#">
                transparent, simple, and fair
              </a>
              . That's why we've built a platform that protects both parties,
              promotes genuine engagement, and encourages people to help each
              other succeed.
            </p>

            <p>
              <a className="underline text-slate-100 font-medium" href="#">
                Still curious about how it all works?
              </a>{" "}
              We'll walk you through it step by step below.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full bg-white py-16">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 text-lg">
              Got questions? We've got the answers you need to get started.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex rounded-lg bg-[#FBFBFE] p-1">
              <button
                onClick={() => setActiveTab("general")}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "general"
                    ? "text-white bg-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab("features")}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "features"
                    ? "text-white bg-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "resources"
                    ? "text-white bg-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Resources
              </button>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white shadow-sm rounded-lg p-8">
            <Accordion
              type="single"
              collapsible
              defaultValue="what-is-refreeg"
              className="space-y-4"
            >
              {faqData[activeTab as keyof typeof faqData].map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border border-gray-200 rounded-lg px-6 data-[state=open]:bg-gray-50/50"
                >
                  <AccordionTrigger className="hover:no-underline py-4 text-left">
                    <span className="font-medium text-gray-900 flex items-center gap-3">
                      <span className={faq.iconColor}>{faq.icon}</span>
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
}
