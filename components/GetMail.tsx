"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const GetMail = () => {
  const [message, setMessage] = useState("");
  const pathname = usePathname();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Thank you for subscribing!");
    setTimeout(() => setMessage(""), 3000);
  };

  // 🎨 Match same color logic as Footer (route-based)
  const btnColor =
    pathname === "/businesses"
      ? "bg-[#003E25] hover:bg-[#004d2d]"
      : pathname === "/healthcare"
      ? "bg-[#8C1823] hover:bg-[#a71d2b]"
      : pathname === "/disaster-relief"
      ? "bg-[#0A0A0B] hover:bg-[#1a1a1b]"
      : pathname === "/non-profits"
      ? "bg-purple-600 hover:bg-purple-700"
      : "bg-secondary hover:bg-secondary/80";

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full max-w-sm mt-2"
      >
        {/* Email Input */}
        <div className="relative w-full">
          <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 size-4" />
          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            className="w-full h-[45px] pl-10 pr-28 text-[13px] rounded-3xl outline-none 
                       border border-gray-300 placeholder:text-gray-400 placeholder:font-medium"
          />
        </div>

        {/* Subscribe Button */}
        <Button
          type="submit"
          className={`absolute right-1 top-1/2 -translate-y-1/2 text-white text-[13px] 
                     font-medium rounded-3xl px-5 py-2 transition-colors ${btnColor}`}
        >
          Subscribe
        </Button>
      </form>

      {/* Success Message */}
      {message && (
        <div className="mt-3 bg-green-500 text-white py-2 px-4 rounded-md text-sm animate-fade-in">
          {message}
        </div>
      )}
    </div>
  );
};

export default GetMail;
