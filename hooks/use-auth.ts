"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { getCurrentUser } from "@/actions/auth-actions"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()


  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error getting current user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    console.log("signIn", email, password)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.log("Supabase error:", error)
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        })
        console.log("Toast shown for Supabase error")
        return
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })

      // Redirect to home page instead of dashboard
      router.push("/")
    } catch (error: any) {
      console.log("Caught error:", error)
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      })
      console.log("Toast shown for caught error")
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      toast({
        title: "Check your email",
        description: "We've sent you a verification link.",
      })
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    })
  }

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  }
}

