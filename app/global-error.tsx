"use client";

import { useRouter } from "next/navigation";
import { SupportErrorCta } from "@/components/support-error-cta";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <html lang="en">
      <body className="font-montserrat antialiased">
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 sm:px-6">
          <SupportErrorCta
            title="We hit an unrecoverable error"
            description="Please follow us on X and join our Telegram community for customer support while we sort this out."
            errorMessage={error.message}
            onRetry={() => router.push("/")}
            retryLabel="Go home"
          />
        </main>
      </body>
    </html>
  );
}
