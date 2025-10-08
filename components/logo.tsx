// components/logo.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Logo() {
  const pathname = usePathname();
  const isNonProfitsPage = pathname === "/non-profits";
  
  return (
    <div className="">
      <Link href="/" className="flex items-center space-x-2">
        <Image 
          src={isNonProfitsPage ? "/logo-nonprofits.svg" : "/logo.svg"} 
          alt="logo" 
          width={52} 
          height={52} 
        />
      </Link>
    </div>
  );
}