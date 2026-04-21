"use client";

import Image from "next/image";

export default function NavigationLoader() {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#003366] border-r-[#214570]" />
          <div className="absolute inset-[10px] animate-[spin_1.4s_linear_infinite_reverse] rounded-full border-2 border-transparent border-b-blue-400" />

          <div className="relative z-10 h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm sm:h-20 sm:w-20">
            <Image
              src="/logo.svg"
              alt="RefreeG logo"
              width={72}
              height={72}
              className="h-full w-full object-contain"
              priority
            />
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-[#003366] sm:text-base">
            Loading RefreeG
          </p>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Please wait while we prepare your page...
          </p>
        </div>
      </div>
    </div>
  );
}
