import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import type { CookieOptions } from "@supabase/auth-helpers-nextjs"

// This client is for use in Pages Router components (pages/ directory)
export const createPagesServerClient = (
  context: GetServerSidePropsContext | { req: NextApiRequest; res: NextApiResponse },
) => {
  return createServerComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookies: {
      get(name: string) {
        return context.req.cookies[name]
      },
      set(name: string, value: string, options: CookieOptions) {
        context.res.setHeader("Set-Cookie", `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`)
      },
      remove(name: string, options: CookieOptions) {
        context.res.setHeader("Set-Cookie", `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
      },
    },
  })
}

