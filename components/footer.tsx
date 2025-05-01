import Link from "next/link";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { Linkedin, Youtube } from "lucide-react";
import React, { ReactNode } from "react";
import GetMail from "./GetMail";
import {
  contactLinks,
  legalLinks,
  quickLinks,
  socialLinks,
} from "@/lib/links";

const Icon = ({ href, children }: { href: string; children: ReactNode }) => {
  return (
    <Link
      href={href}
      className="bg-secondary-9 rounded-full flex items-center justify-center size-[30px] text-black transition-all duration-300 transform hover:scale-110 hover:bg-secondary-7"
    >
      {children}
    </Link>
  );
};

export function Footer() {
  return (
    <>
      <div className="flex flex-col items-center w-10/12 lg:w-8/12 mx-auto rounded-3xl text-white bg-customNavyBlue2 px-10 py-10 mb-16">
        <div className="text-lg lg:text-3xl font-semibold mb-6">
          Ready to be part of the solution?
        </div>
        <div className="w-11/12 text-center text-base lg:text-lg mb-6">
          Join the RefreeG community and become a RefreeGerian today! By joining
          us, you contribute to empowering less privileged individuals in
          African communities, supporting causes that foster socio-economic
          growth, and promoting sustainable development. Together, we can make a
          significant impact and create a brighter future for all.
        </div>
        <Link
          href="https://t.me/+d67UCIer8c01ODhk"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="flex border rounded-md bg-white px-3 py-3 text-blue-900 font-semibold hover:bg-gray-300 transition delay-150">
            Join our community
          </button>
        </Link>
      </div>
      <section className="w-full h-full px-[10px] md:px-[50px] py-[25px] mt-[30px] bg-footer bg-[#F5FAFF]">
        <div className="md:flex md:justify-between md:space-x-3 space-y-4 md:space-y-0">
          <div className="w-full md:w-4/12">
            <p className="font-semibold text-[18px] mb-2">Subscribe</p>
            <p className="text-[15px] font-light">
              Join our newsletter to stay up to date on features <br />
              and releases
            </p>

            {/* Wrap GetMail in a full-width div */}
            <div className="w-full">
              <GetMail />
            </div>

            <p className="text-[10px] mt-3">
              By Subscribing you agree with our{" "}
              <Link
                href="https://www.refreeg.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="font-medium underline">Privacy policy</span>
              </Link>
            </p>
          </div>

          <div className="w-full md:w-2/12">
            <p className="font-medium text-[15px]">Quick Links</p>
            <div className="flex flex-col space-y-3 pt-4">
              {quickLinks.map((link) => (
                <a
                  className="underline font-light text-[15px] text-dark cursor-pointer hover:text-secondary-7 transition-colors duration-300"
                  href={link.route}
                  key={link.key}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="w-full md:w-2/12">
            <p className="font-medium text-[15px]">Contact Us</p>
            <div className="flex flex-col space-y-3 pt-4">
              {contactLinks.map((link) => (
                <a
                  className="underline font-light text-[15px] text-dark cursor-pointer hover:text-secondary-7 transition-colors duration-300"
                  href={link.route}
                  key={link.key}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="w-full md:w-2/12">
            <p className="font-medium text-[15px]">Legal</p>
            <div className="flex flex-col space-y-3 pt-4">
              {legalLinks.map((link) => (
                <a
                  className="underline font-light text-[15px] text-dark cursor-pointer hover:text-secondary-7 transition-colors duration-300"
                  href={link.route}
                  key={link.key}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <hr className="border-[#A6A6A6] my-[30px]" />
        <div className="md:flex md:justify-between w-full">
          <p className="text-[13px] text-center md:text-left mb-2 md:mb-0">
            Copyright © 2024{" "}
            <span className="text-bold font-medium underline">
              Eiza Innovations.
            </span>{" "}
            All Rights Reserved.
          </p>

          <div className="mx-auto md:mx-0 flex space-x-3 items-center w-fit md:justify-normal">
            <Icon href={socialLinks.Facebook}>
              <FaFacebookF size={15} />
            </Icon>
            <Icon href={socialLinks.instagram}>
              <FaInstagram size={15} />
            </Icon>
            <Icon href={socialLinks.twitter}>
              <FaXTwitter size={15} />
            </Icon>
            <Icon href={socialLinks.linkedin}>
              <Linkedin width={15} height={15} />
            </Icon>
            <Icon href={socialLinks.Youtube}>
              <Youtube width={15} height={15} />
            </Icon>
          </div>
        </div>
      </section>
    </>
  );
}
