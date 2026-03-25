// components/logo.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Logo() {
  const pathname = usePathname();

  // Determine which logo to show based on the current path
  const getLogoSrc = () => {
    switch (pathname) {
      case "/non-profits":
        return "/logo-nonprofits.svg";
      case "/businesses":
        return "/logo-businesses.svg";
      case "/healthcare":
        return "/logo-healthcare.svg";
      case "/disaster-relief":
        return "/logo-disaster-relief.svg";
      default:
        return "/logo.svg";
    }
  };

  return (
    <div>
      <Link href="/" className="flex items-center space-x-2">
        <Image
          src={getLogoSrc()}
          alt="RefreeG logo"
          width={52}
          height={52}
          priority
        />
      </Link>
    </div>
  );
}
