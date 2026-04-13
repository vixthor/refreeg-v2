"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Linkedin,
  Mail,
  MapPin,
  MoveRight,
  Phone,
  Send,
  Youtube,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";
import { Logo } from "@/components/logo";
import { contactLinks, legalLinks, quickLinks, socialLinks } from "@/lib/links";
import { cn } from "@/lib/utils";

type FooterLink = {
  label: string;
  href: string;
};

const platformLinks: FooterLink[] = [
  ...quickLinks.map((link) => ({ label: link.label, href: link.route })),
  { label: "Explore Causes", href: "/causes" },
  { label: "Petitions", href: "/petitions" },
  { label: "How It Works", href: "/how-it-works" },
];

const resourceLinks: FooterLink[] = [
  { label: "Start a Cause", href: "/dashboard/causes/create" },
  { label: "Fees & Payouts", href: "/crowdfund/fees" },
  { label: "FAQ", href: "/#faq" },
  { label: "API", href: "/docs/api" },
];

const socialItems = [
  {
    label: "TikTok",
    href: socialLinks.tiktok,
    icon: <FaTiktok className="h-5 w-5" />,
  },
  {
    label: "X",
    href: socialLinks.twitter,
    icon: <FaXTwitter className="h-5 w-5" />,
  },
  {
    label: "Instagram",
    href: socialLinks.instagram,
    icon: <FaInstagram className="h-5 w-5" />,
  },
  {
    label: "LinkedIn",
    href: socialLinks.linkedin,
    icon: <Linkedin className="h-5 w-5" />,
  },
  {
    label: "Facebook",
    href: socialLinks.Facebook,
    icon: <FaFacebookF className="h-5 w-5" />,
  },
  {
    label: "YouTube",
    href: socialLinks.Youtube,
    icon: <Youtube className="h-5 w-5" />,
  },
  {
    label: "Community",
    href: socialLinks.community,
    icon: <Send className="h-5 w-5" />,
  },
];

const contactIcons = [
  <Mail key="mail" className="h-4 w-4" />,
  <Phone key="phone" className="h-4 w-4" />,
  <MapPin key="map" className="h-4 w-4" />,
];

const routeThemes = {
  default: {
    shell:
      "border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)]",
    panel: "border-white/80 bg-white/80",
    badge: "border-blue-200 bg-blue-50 text-secondary",
  },
  "/businesses": {
    shell:
      "border-emerald-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_30%),linear-gradient(180deg,#f3fbf7_0%,#e8f6ef_100%)]",
    panel: "border-white/80 bg-white/82",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  "/non-profits": {
    shell:
      "border-violet-200 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.15),_transparent_30%),linear-gradient(180deg,#fbf7ff_0%,#f4ecff_100%)]",
    panel: "border-white/80 bg-white/82",
    badge: "border-violet-200 bg-violet-50 text-violet-900",
  },
  "/healthcare": {
    shell:
      "border-rose-200 bg-[radial-gradient(circle_at_top_left,_rgba(225,29,72,0.14),_transparent_30%),linear-gradient(180deg,#fff8f8_0%,#fff1f3_100%)]",
    panel: "border-white/80 bg-white/82",
    badge: "border-rose-200 bg-rose-50 text-rose-900",
  },
  "/disaster-relief": {
    shell:
      "border-slate-700 bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.16),_transparent_30%),linear-gradient(180deg,#0f172a_0%,#111827_100%)]",
    panel: "border-white/10 bg-white/5",
    badge: "border-white/10 bg-white/10 text-slate-100",
  },
} as const;

function FooterLinkItem({ href, label }: FooterLink) {
  const pathname = usePathname();
  const isDarkTheme = pathname === "/disaster-relief";
  const className =
    isDarkTheme
      ? "group inline-flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-slate-200 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/14 hover:text-white active:scale-[0.99]"
      : "group inline-flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent bg-white/55 px-3 py-2.5 text-sm text-slate-600 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:text-blue-700 active:scale-[0.99]";

  const iconClassName = isDarkTheme
    ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-slate-200 transition-all group-hover:bg-white/20 group-hover:text-white"
    : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all group-hover:bg-blue-50 group-hover:text-blue-700";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        <span>{label}</span>
        <span className={iconClassName}>
          <MoveRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      <span>{label}</span>
      <span className={iconClassName}>
        <MoveRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </a>
  );
}

function ContactItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDarkTheme = pathname === "/disaster-relief";
  const className =
    isDarkTheme
      ? "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm leading-6 text-slate-200 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/14 hover:text-white"
      : "flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-2.5 text-sm leading-6 text-slate-600 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950";
  const content = (
    <>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
          isDarkTheme
            ? "bg-white/15 text-slate-100"
            : "bg-slate-100 text-slate-500",
        )}
      >
        {icon}
      </span>
      <span>{label}</span>
    </>
  );

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {content}
    </a>
  );
}

export function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const theme =
    routeThemes[pathname as keyof typeof routeThemes] ?? routeThemes.default;
  const isDarkTheme = pathname === "/disaster-relief";


  return (
    <footer className="bg-background px-4 pb-5 pt-10 sm:px-6 lg:px-8">
      <div
        className={cn(
          "mx-auto max-w-7xl overflow-hidden rounded-[28px] border shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]",
          theme.shell,
        )}
      >
        <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
          <div
            className={cn(
              "rounded-[24px] border p-5 backdrop-blur sm:p-6",
              theme.panel,
            )}
          >
            <div className="max-w-3xl lg:mx-auto lg:flex lg:flex-col lg:items-center">
              <div className="flex items-center gap-3 lg:justify-center">
                <Logo />
                <div className="text-left">
                  <p className="text-lg font-semibold text-slate-950">
                    RefreeG
                  </p>
                  <p className="text-sm text-slate-500">
                    Transparent crowdfunding for causes that matter.
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base lg:text-center">
                Launch causes, receive support, and keep donors informed with a
                platform built for trust, faster giving, and real community
                impact.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div
              className={cn(
                "rounded-[24px] border p-5 backdrop-blur sm:p-6",
                theme.panel,
              )}
            >
              <span
                className={cn(
                  "inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                  isDarkTheme
                    ? "border border-white/10 bg-white/10 text-slate-100"
                    : "border border-slate-200 bg-white/80 text-slate-500",
                )}
              >
                Contact
              </span>
              <div className="mt-5 grid gap-3">
                {contactLinks.map((link, index) => (
                  <ContactItem
                    key={`${link.label}-${link.route}`}
                    href={link.route}
                    label={link.label}
                    icon={contactIcons[index] ?? <Mail className="h-4 w-4" />}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div
                className={cn(
                  "rounded-[24px] border p-5 backdrop-blur sm:p-6",
                  theme.panel,
                )}
              >
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                    isDarkTheme
                      ? "border border-white/10 bg-white/10 text-slate-100"
                      : "border border-slate-200 bg-white/80 text-slate-500",
                  )}
                >
                  Platform
                </span>
                <div className="mt-5 flex flex-col gap-3">
                  {platformLinks.map((link) => (
                    <FooterLinkItem
                      key={`${link.label}-${link.href}`}
                      href={link.href}
                      label={link.label}
                    />
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  "rounded-[24px] border p-5 backdrop-blur sm:p-6",
                  theme.panel,
                )}
              >
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                    isDarkTheme
                      ? "border border-white/10 bg-white/10 text-slate-100"
                      : "border border-slate-200 bg-white/80 text-slate-500",
                  )}
                >
                  Resources
                </span>
                <div className="mt-5 flex flex-col gap-3">
                  {resourceLinks.map((link) => (
                    <FooterLinkItem
                      key={`${link.label}-${link.href}`}
                      href={link.href}
                      label={link.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "rounded-[24px] border p-5 backdrop-blur sm:p-6",
              theme.panel,
            )}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                    isDarkTheme
                      ? "border border-white/10 bg-white/10 text-slate-100"
                      : "border border-slate-200 bg-white/80 text-slate-500",
                  )}
                >
                  Social
                </span>
                <p
                  className={cn(
                    "mt-4 text-xl font-semibold sm:text-2xl",
                    isDarkTheme ? "text-white" : "text-slate-950",
                  )}
                >
                  Follow RefreeG
                </p>
                <p
                  className={cn(
                    "mt-3 text-sm leading-7",
                    isDarkTheme ? "text-slate-300" : "text-slate-600",
                  )}
                >
                  Stay close to new campaigns, platform updates, and community
                  stories across our social channels.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      isDarkTheme
                        ? "bg-white/10 text-slate-100"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    Campaign updates
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      isDarkTheme
                        ? "bg-white/10 text-slate-100"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    Community stories
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      isDarkTheme
                        ? "bg-white/10 text-slate-100"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    Platform news
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 lg:max-w-[620px] lg:justify-end">
                {socialItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group inline-flex min-w-[140px] items-center gap-3 rounded-2xl px-4 py-3.5 text-sm transition-all hover:-translate-y-0.5 sm:min-w-fit",
                      isDarkTheme
                        ? "border border-white/10 bg-white/10 text-slate-100 hover:border-white/20 hover:bg-white/14 hover:text-white"
                        : "border border-slate-200/70 bg-white/70 text-slate-600 hover:border-slate-300 hover:text-slate-950",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors",
                        isDarkTheme
                          ? "bg-white/15 text-slate-100 group-hover:bg-white group-hover:text-slate-950"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-900 group-hover:text-white",
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="text-[15px] font-medium">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div
            className={cn(
              "flex flex-col gap-4 border-t px-1 pt-2 text-sm md:flex-row md:items-center md:justify-between",
              isDarkTheme
                ? "border-white/10 text-slate-300"
                : "border-white/50 text-slate-500",
            )}
          >
            <p>Copyright © {year} RefreeG. Built by Eiza Innovations.</p>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={`${link.label}-legal`}
                  href={link.route}
                  className={cn(
                    "transition-colors",
                    isDarkTheme
                      ? "hover:text-white"
                      : "hover:text-slate-950",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>

  );
}
