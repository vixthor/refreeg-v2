import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

/**
 * Refreshes the Supabase session and returns both the response (with
 * updated cookies) and the authenticated user (or null).
 *
 * This is the SINGLE place where `getUser()` is called during a request.
 * The root middleware should use the returned `user` instead of creating
 * a second Supabase client.
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
}> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user: User | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) {
      user = data.user;
    }
  } catch (err) {
    // Swallow network/auth fetch errors in middleware to avoid
    // terminating requests during transient Supabase connectivity issues.
    // eslint-disable-next-line no-console
    console.error("Supabase middleware getUser error:", err);
  }

  return { response: supabaseResponse, user };
}
