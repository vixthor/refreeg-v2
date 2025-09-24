"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { toast } from "@/components/ui/use-toast"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        toast({
          title: "Error sending reset email",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      setIsEmailSent(true)
      toast({
        title: "Reset email sent",
        description: "Check your email for the password reset link.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isEmailSent ? "Check your email" : "Reset your password"}
            </CardTitle>
            <CardDescription className="text-center">
              {isEmailSent
                ? "We've sent a password reset link to your email address."
                : "Enter your email address and we'll send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {!isEmailSent ? (
              <form onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="mt-2" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <Icons.mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  If an account exists for {email}, you will receive a password reset link shortly.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            {!isEmailSent && (
              <div className="text-sm text-center text-muted-foreground mt-2">
                Remember your password?{" "}
                <Link href="/auth/signin" className="underline underline-offset-4 hover:text-primary">
                  Sign in
                </Link>
              </div>
            )}
            {isEmailSent && (
              <div className="text-sm text-center text-muted-foreground mt-2">
                Didn't receive the email?{" "}
                <button
                  onClick={() => setIsEmailSent(false)}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Try again
                </button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}