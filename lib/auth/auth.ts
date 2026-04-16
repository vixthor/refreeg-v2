import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"

/**
 * Derive a human-readable device label from the browser's User-Agent.
 */
function getDeviceLabel(userAgent: string | null): string {
  if (!userAgent) return "Unknown Device"
  if (/android/i.test(userAgent)) return "Android"
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS"
  if (/mac os x/i.test(userAgent)) return "Mac"
  if (/windows/i.test(userAgent)) return "Windows"
  if (/linux/i.test(userAgent)) return "Linux"
  return "Unknown Device"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.profile.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user?.password) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!valid) return null

        return { id: user.id, email: user.email, name: user.fullName }
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      if (user.email) {
        try {
          const reqHeaders = await headers()
          const userAgent = reqHeaders.get("user-agent")
          
          // Dynamically import to avoid pulling 'fs' and 'nodemailer' into Edge runtime
          const { sendLoginNotificationEmail } = await import("@/services/mail")
          // Fire and forget so we don't block the login request (which was causing 12s delays)
          sendLoginNotificationEmail({
            email: user.email as string,
            userName: user.name as string,
            loginTime: new Date().toLocaleString(),
            device: getDeviceLabel(userAgent),
          }).catch(e => console.error("Login notification email error:", e))
        } catch (e) {
          console.error("Login notification prep error:", e)
        }
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/onboarding",
  },
})
