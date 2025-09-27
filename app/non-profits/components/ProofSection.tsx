"use client";

import { useState } from "react";

export default function ProofSection() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Content Section */}
        <div className="space-y-8">
          {/* Trust Badge */}
          <div className="inline-block">
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-200/50 shadow-sm">
              <p className="text-sm text-gray-600 font-medium">
                Powered by vetted, audited smart contracts. Withdraw anytime.
                Your funds remain yours — always.
              </p>
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Donors Want Proof.{" "}
              <span className="text-blue-600">We Help You</span>
            </h1>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-400">
              Provide It.
            </h2>
          </div>

          {/* Description */}
          <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
            RefreeG's fraud-compliance system and blockchain-powered
            transparency protect donors and elevate your credibility, so your
            nonprofit stands out as trustworthy and professional.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <button
              className={`group relative overflow-hidden bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                isHovered ? "shadow-2xl" : "shadow-lg"
              }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="relative z-10 flex items-center gap-3">
                Get started
                <svg
                  className={`w-6 h-6 transition-transform duration-300 ${
                    isHovered ? "translate-x-1" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>

        {/* Visual Section */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-yellow-400/20 blur-2xl rounded-full" />

            {/* Main Visual Container */}
            <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              {/* Coins Stack */}
              <div className="relative mb-6">
                {/* Gold Coins */}
                <div className="flex items-end justify-center space-x-2">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 ${
                        i % 2 === 0 ? "animate-bounce" : ""
                      }`}
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: "2s",
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center">
                        <span className="text-xs font-bold text-yellow-800">
                          $
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shield with Checkmark */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-xl">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {/* Pulse Animation */}
                  <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20" />
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-6 h-6 bg-green-400 rounded-full animate-pulse" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-400 rounded-full animate-bounce" />
              <div className="absolute top-1/2 -right-6 w-3 h-3 bg-pink-400 rounded-full animate-ping" />
            </div>

            {/* Additional Floating Coins */}
            <div className="absolute -top-8 -left-8 w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg animate-float">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center">
                <span className="text-sm font-bold text-yellow-800">€</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-8 w-10 h-10 bg-gradient-to-br from-green-300 to-green-500 rounded-full shadow-lg animate-float">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-green-200 to-green-400 flex items-center justify-center">
                <span className="text-sm font-bold text-green-800">$</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-100/20 to-transparent rounded-full" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-yellow-100/20 to-transparent rounded-full" />
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
