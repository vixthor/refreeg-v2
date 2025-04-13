"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Icons } from "@/components/icons"
import { useAuth } from "@/hooks/use-auth"
import { useDonation } from "@/hooks/use-donation"
import { useProfile } from "@/hooks/use-profile"


interface DonationFormProps {
  causeId: string
  profile: {
    email?: string
    name?: string
  }
}

export function DonationForm({ causeId , profile}: DonationFormProps) {
 
  const { isLoading, createDonation } = useDonation()
  const [formData, setFormData] = useState({
    amount: "",
    name:  profile?.name || "",
    email:  profile?.email || "",
    message: "",
    isAnonymous: false,
  })


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isAnonymous: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // await createDonation(causeId, user?.id || null, formData)
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Donation</CardTitle>
        <CardDescription>Your contribution helps make a difference</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Donation Amount (₦)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="Enter amount in Naira"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required={!formData.isAnonymous}
              disabled={formData.isAnonymous}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Leave a message of support"
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="anonymous" checked={formData.isAnonymous} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="anonymous">Donate anonymously</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Donate Now"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

