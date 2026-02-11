import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  // Create a server's supabase client with newly configured cookie,
  // which could be used to maintain user's session
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Disable automatic refresh on the server to avoid refresh-token
      // rotation races ("refresh_token_already_used") when multiple
      // server requests attempt to refresh the same token concurrently.
      auth: {
        autoRefreshToken: false,
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // swallow cookie errors on the server
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Use the RequestCookies.delete API to properly remove cookies
            // instead of setting an empty value which can propagate an
            // empty string into downstream DB queries (invalid uuid: "").
            // `delete` accepts the same options shape as `set`.
            // @ts-ignore - some versions expose `delete` as `delete`.
            // Use runtime method to avoid TypeScript complaints.
            ;(cookieStore as any).delete(name, options)
          } catch (error) {
            // swallow cookie errors on the server
          }
        },
      },
    }
  )
}