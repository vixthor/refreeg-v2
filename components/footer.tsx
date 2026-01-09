"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaTiktok,
} from "react-icons/fa6";
import { Linkedin, Youtube } from "lucide-react";
import React from "react";
import GetMail from "./GetMail";
import { contactLinks, legalLinks, quickLinks, socialLinks } from "@/lib/links";

const SocialLink = ({
  href,
  children,
  label,
}: {
  href: string;
  children: React.ReactNode;
  label: string;
}) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center space-x-2 text-dark hover:text-secondary-7 transition-colors duration-300 group"
  >
    <div className="bg-secondary-9 rounded-full flex items-center justify-center size-[30px] text-black transition-all duration-300 group-hover:scale-110 group-hover:bg-secondary-7">
      {children}
    </div>
    <span className="text-[14px] font-light">{label}</span>
  </Link>
);

export function Footer() {
  const pathname = usePathname();

  const getPageTheme = () => {
    switch (pathname) {
      case "/non-profits":
        return {
          bg: "bg-purple-600",
          button:
            "bg-white text-purple-600 hover:bg-purple-700 hover:text-white",
        };
      case "/businesses":
        return {
          bg: "bg-[#004D40]",
          button: "bg-white text-green-700 hover:bg-green-800 hover:text-white",
        };
      case "/healthcare":
        return {
          bg: "bg-[#8C1823]",
          button: "bg-white text-[#8C1823] hover:bg-[#8C1823] hover:text-white",
        };
      case "/disaster-relief":
        return {
          bg: "bg-[#0A0A0B]",
          button: "bg-white text-[#0A0A0B] hover:bg-[#0A0A0B] hover:text-white",
        };
      default:
        return {
          bg: "bg-secondary",
          button: "bg-white text-blue-900 hover:bg-gray-300",
        };
    }
  };

  const { bg, button } = getPageTheme();

  return (
    <div className="pt-1 bg-muted">
      <section className="w-full h-full px-[10px] md:px-[50px] py-[25px] mt-[30px] bg-muted">
        <div className="md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 space-y-8 md:space-y-0">
          <div className="w-full">
            <p className="font-medium text-[15px] mb-3">Quick Links</p>
            <div className="flex flex-col space-y-2">
              {quickLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.route}
                  className="underline font-light text-[15px] text-dark cursor-pointer hover:text-secondary-7 transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="w-full">
            <p className="font-medium text-[15px] mb-3">Contact Us</p>
            <div className="flex flex-col space-y-2">
              {contactLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.route}
                  className="underline font-light text-[15px] text-dark cursor-pointer hover:text-secondary-7 transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="w-full">
            <p className="font-medium text-[15px] mb-3">Legal</p>
            <div className="flex flex-col space-y-2">
              {legalLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.route}
                  className="underline font-light text-[15px] text-dark cursor-pointer hover:text-secondary-7 transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="w-full">
            <p className="font-medium text-[15px] mb-3">Follow Us</p>
            <div className="flex flex-col space-y-3 pt-1">
              {socialLinks.tiktok && (
                <SocialLink href={socialLinks.tiktok} label="TikTok">
                  <FaTiktok size={18} />
                </SocialLink>
              )}

              {socialLinks.twitter && (
                <SocialLink href={socialLinks.twitter} label="X (Twitter)">
                  <FaXTwitter size={18} />
                </SocialLink>
              )}

              {socialLinks.linkedin && (
                <SocialLink href={socialLinks.linkedin} label="LinkedIn">
                  <Linkedin width={18} height={18} />
                </SocialLink>
              )}

              {socialLinks.instagram && (
                <SocialLink href={socialLinks.instagram} label="Instagram">
                  <FaInstagram size={18} />
                </SocialLink>
              )}

              {socialLinks.Facebook && (
                <SocialLink href={socialLinks.Facebook} label="Facebook">
                  <FaFacebookF size={18} />
                </SocialLink>
              )}

              {socialLinks.Youtube && (
                <SocialLink href={socialLinks.Youtube} label="YouTube">
                  <Youtube width={18} height={18} />
                </SocialLink>
              )}
            </div>
          </div>
        </div>

        <hr className="border-[#A6A6A6] my-[30px]" />

        <div className="md:flex md:justify-center items-center w-full">
          <p className="text-[13px] text-center mb-4 md:mb-0">
            Copyright © 2024{" "}
            <span className="font-bold underline">Eiza Innovations.</span> All
            Rights Reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
