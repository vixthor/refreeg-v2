import React from "react";
import Image from "next/image";
import { FaSearch, FaPencilAlt, FaChartArea } from "react-icons/fa";
import { FaMessage, FaLock } from "react-icons/fa6";
import { ChevronDown } from "lucide-react";

function WhyRefreeG() {
  const steps = [
    {
      title: "Discover",
      description:
        "Browse impactful causes from individuals and communities across Nigeria and beyond.",
      icon: "/eye-icon.svg",
      decorativeImage: "/cursor.svg",
      position: "right",
    },
    {
      title: "Create",
      description:
        "Start a cause in minutes — no complex forms or approval bottlenecks.",
      icon: "/create-icon.svg",
      decorativeImage: null,
      position: "left",
    },
    {
      title: "Engage",
      description:
        "Like, share, or comment to amplify the message and build momentum.",
      icon: "/engage-icon.svg",
      decorativeImage: "/bell.svg",
      position: "right",
    },
    {
      title: "Track",
      description:
        "Follow your cause or donation help supporters follow the journey and see results.",
      icon: "/track-icon.svg",
      decorativeImage: null,
      position: "left",
    },
    {
      title: "Trust",
      description:
        "Every cause is screened, and our system ensures complete policy and accountability.",
      icon: "/trust-icon.svg",
      decorativeImage: "/lock.svg",
      position: null,
    },
  ];

  return (
    <section className="py-8 md:py-16 bg-gray-50">
      <div className="container w-full px-4 md:px-0">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">
            Why <span className="underline decoration-black">RefreeG</span>?
          </h2>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto px-4 md:px-0">
            RefreeG is built to empower everyday people to spark change, support
            real causes, and rally their communities — all in one platform.
          </p>
        </div>

        {/* Steps Flow */}
        <div className="relative w-full mx-auto">
          {steps.map((step, index) => {
            // Force decorative images for first, second and last steps to the left
            const forceLeftIndices = [0, 1, steps.length - 1];
            const placeLeft = forceLeftIndices.includes(index)
              ? true
              : step.position !== "right";
            const posStyle = placeLeft ? { left: "-80px" } : { right: "-80px" };
            return (
              <div
                key={step.title}
                className="relative mb-16 md:mb-32 last:mb-0"
              >
                {/* Decorative image positioned absolutely so it doesn't affect layout - hidden on mobile */}
                {step.decorativeImage && (
                  <div
                    className="hidden lg:block absolute top-6 pointer-events-none z-0"
                    style={posStyle}
                  >
                    <Image
                      src={step.decorativeImage}
                      alt={`${step.title} decoration`}
                      width={240}
                      height={240}
                    />
                  </div>
                )}
                {/* (removed earlier arrows -- arrows are rendered from the center column to control spacing) */}

                {index === steps.length - 1 ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="relative">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 border-[#7DA7D9] shadow-lg z-10 mx-auto">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[#222]">
                          {step.title === "Discover" && (
                            <FaSearch className="text-lg md:text-xl" />
                          )}
                          {step.title === "Create" && (
                            <FaPencilAlt className="text-lg md:text-xl" />
                          )}
                          {step.title === "Engage" && (
                            <FaMessage className="text-lg md:text-xl" />
                          )}
                          {step.title === "Track" && (
                            <FaChartArea className="text-lg md:text-xl" />
                          )}
                          {step.title === "Trust" && (
                            <FaLock className="text-lg md:text-xl" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-6 text-center z-20 max-w-xs mx-auto px-4">
                      <h3 className="text-xl md:text-2xl font-bold mb-1">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-xs md:text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="md:grid md:grid-cols-3 md:gap-0 md:items-center w-full flex flex-col items-center">
                    {/* Mobile: show content above icon, Desktop: Left column for right-positioned content */}
                    <div className="md:flex md:justify-end order-2 md:order-1">
                      {step.position === "right" && (
                        <div className="text-center md:text-right max-w-sm z-20 mt-2 mb-4 md:mb-0 px-4 md:px-0">
                          <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 text-xs md:text-base">
                            {step.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Center column: icon - always in center for mobile and desktop */}
                    <div className="flex justify-center order-1 md:order-2">
                      <div className="relative">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 border-[#7DA7D9] shadow-lg z-10">
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[#222]">
                            {step.title === "Discover" && (
                              <FaSearch className="text-lg md:text-xl" />
                            )}
                            {step.title === "Create" && (
                              <FaPencilAlt className="text-lg md:text-xl" />
                            )}
                            {step.title === "Engage" && (
                              <FaMessage className="text-lg md:text-xl" />
                            )}
                            {step.title === "Track" && (
                              <FaChartArea className="text-lg md:text-xl" />
                            )}
                          </div>
                        </div>

                        {/* Arrows: smaller on mobile */}
                        {index < steps.length - 1 && (
                          <div
                            className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 flex-col justify-between items-center z-0 pointer-events-none w-full h-full"
                            style={{
                              top: "calc(100% + 20px)",
                              height: "100px",
                            }}
                          >
                            {Array.from({ length: 3 }).map((_, i) => (
                              <ChevronDown
                                key={i}
                                className="w-8 h-8 text-[#B5CDE9] opacity-90"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile: show content below icon, Desktop: Right column for left-positioned content */}
                    <div className="md:flex md:justify-start order-3">
                      {step.position === "left" && (
                        <div className="text-center md:text-left max-w-sm z-20 mt-4 md:mt-2 px-4 md:px-0">
                          <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 text-xs md:text-base">
                            {step.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyRefreeG;
