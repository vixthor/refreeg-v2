"use client";
import { Mail } from "lucide-react";
import React, { useState } from "react";
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

  // ✅ Match same color logic as Footer
  const btnColor =
    pathname === "/businesses"
      ? "bg-[#003E25] hover:bg-[#004d2d]"
      : pathname === "/healthcare"
      ? "bg-[#8C1823] hover:bg-[#a71d2b]"
      : pathname === "/disaster-relief"
      ? "bg-[#0A0A0B] hover:bg-[#1a1a1b]"
      : "bg-secondary hover:bg-secondary-7";

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative size-fit mt-2">
        <input
          type="email"
          name="email"
          className="bg-white rounded-3xl h-[45px] outline-none border-none placeholder:text-bold placeholder:font-medium 
          placeholder:text-[12px] text-[12px] pl-[50px] pr-[120px] flex items-center w-full"
          placeholder="Enter your Email"
          required
        />
        <Mail className="text-bold size-4 absolute top-[15px] left-6" />
        <Button
          type="submit"
          className={`text-white font-medium flex items-center justify-center text-[12px] h-[80%] absolute top-1 right-2 px-5 rounded-3xl cursor-pointer transition-all duration-300 ${btnColor}`}
        >
          Subscribe
        </Button>
      </form>

      {message && (
        <div className="mt-2 bg-green-500 text-white p-2 rounded-md text-sm">
          {message}
        </div>
      )}
    </div>
  );
};

export default GetMail;
