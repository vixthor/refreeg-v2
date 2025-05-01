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
      className="bg-secondary-9 dark:bg-secondary-7 rounded-full flex items-center justify-center size-[30px] text-black dark:text-white transition-all duration-300 transform hover:scale-110 hover:bg-secondary-7 dark:hover:bg-secondary-9"
    >
      {children}
    </Link>
  );
};

export function Footer() {
  return (
    <div className=" pt-8 bg-muted">
      <div className="flex flex-col items-center w-10/12 lg:w-8/12 mx-auto rounded-3xl text-secondary-foreground dark:text-secondary-foreground bg-secondary dark:bg-secondary-8 px-10 py-10 mb-16">
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
          <button className="flex border rounded-md bg-white dark:bg-muted px-3 py-3 text-blue-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition delay-150">
            Join our community
          </button>
        </Link>
      </div>
      <section className="w-full h-full px-[10px] md:px-[50px] py-[25px] mt-[30px] bg-muted">
        <div className="md:flex md:justify-between md:space-x-3 space-y-4 md:space-y-0">
          <div className="w-full md:w-4/12">
            <p className="font-semibold text-[18px] mb-2 dark:text-white">Subscribe</p>
            <p className="text-[15px] font-light dark:text-gray-300">
              Join our newsletter to stay up to date on features <br />
              and releases
            </p>

            <div className="w-full">
              <GetMail />
            </div>

            <p className="text-[10px] mt-3 dark:text-gray-400">
              By Subscribing you agree with our{" "}
              <Link
                href="https://www.refreeg.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="font-medium underline dark:text-gray-300">Privacy policy</span>
              </Link>
            </p>
          </div>

          <div className="w-full md:w-2/12">
            <p className="font-medium text-[15px] dark:text-white">Quick Links</p>
            <div className="flex flex-col space-y-3 pt-4">
              {quickLinks.map((link) => (
                <a
                  className="underline font-light text-[15px] text-dark dark:text-gray-300 cursor-pointer hover:text-secondary-7 dark:hover:text-secondary-5 transition-colors duration-300"
                  href={link.route}
                  key={link.key}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="w-full md:w-2/12">
            <p className="font-medium text-[15px] dark:text-white">Contact Us</p>
            <div className="flex flex-col space-y-3 pt-4">
              {contactLinks.map((link) => (
                <a
                  className="underline font-light text-[15px] text-dark dark:text-gray-300 cursor-pointer hover:text-secondary-7 dark:hover:text-secondary-5 transition-colors duration-300"
                  href={link.route}
                  key={link.key}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="w-full md:w-2/12">
            <p className="font-medium text-[15px] dark:text-white">Legal</p>
            <div className="flex flex-col space-y-3 pt-4">
              {legalLinks.map((link) => (
                <a
                  className="underline font-light text-[15px] text-dark dark:text-gray-300 cursor-pointer hover:text-secondary-7 dark:hover:text-secondary-5 transition-colors duration-300"
                  href={link.route}
                  key={link.key}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <hr className="border-[#A6A6A6] dark:border-gray-700 my-[30px]" />
        <div className="md:flex md:justify-between w-full">
          <p className="text-[13px] text-center md:text-left mb-2 md:mb-0 dark:text-gray-400">
            Copyright © 2024{" "}
            <span className="text-bold font-medium underline dark:text-gray-300">
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
    </div>
  );
}
