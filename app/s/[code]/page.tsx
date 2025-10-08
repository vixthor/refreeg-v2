// app/s/[code]/page.tsx
import { getOriginalUrl } from "@/actions/url-actions";
import { redirect, notFound } from "next/navigation";

export default async function ShortUrlRedirect({
  params,
}: {
  params: { code: string };
}) {
  const myparams = await params;
  const originalUrl = await getOriginalUrl(myparams.code);

  if (!originalUrl) {
    notFound();
  }

  // Extract the path from the full URL
  const url = new URL(originalUrl);
  redirect(url.pathname);
}