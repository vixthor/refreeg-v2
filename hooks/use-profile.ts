"use client"

import { useState, useEffect } from "react"
import { getProfile, updateProfile, updateBankDetails, updateProfilePhoto } from "@/actions/profile-actions"
import type { Profile, ProfileFormData, BankDetailsFormData } from "@/types"
import { toast } from "@/components/ui/use-toast"

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        const profileData = await getProfile(userId)
        setProfile(profileData)
      } catch (err: any) {
        console.error("Error fetching profile:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  const updateUserProfile = async (profileData: ProfileFormData) => {
    if (!userId) {
      throw new Error("User ID is required to update profile")
    }

    try {
      const updatedProfile = await updateProfile(userId, profileData)

      // Update local state
      setProfile(updatedProfile)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      return true
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      })
      return false
    }
  }

  const uploadProfilePhoto = async (file: File) => {
    if (!userId) {
      throw new Error("User ID is required to update profile photo")
    }

    setIsUploading(true)

    try {
      const photoUrl = await updateProfilePhoto(userId, file)

      // Update local state
      setProfile((prev) => (prev ? { ...prev, profile_photo: photoUrl } : null))

      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully.",
      })

      return photoUrl
    } catch (error: any) {
      toast({
        title: "Error updating profile photo",
        description: error.message,
        variant: "destructive",
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const updateUserBankDetails = async (bankData: BankDetailsFormData) => {
    if (!userId) {
      throw new Error("User ID is required to update bank details")
    }

    try {
      const updatedProfile = await updateBankDetails(userId, bankData)

      // Update local state
      setProfile(updatedProfile)

      toast({
        title: "Bank details updated",
        description: "Your bank details have been updated successfully.",
      })

      return true
    } catch (error: any) {
      toast({
        title: "Error updating bank details",
        description: error.message,
        variant: "destructive",
      })
      return false
    }
  }

  return {
    profile,
    isLoading,
    isUploading,
    error,
    updateProfile: updateUserProfile,
    updateProfilePhoto: uploadProfilePhoto,
    updateBankDetails: updateUserBankDetails,
    hasBankDetails: profile ? !!(profile.account_number && profile.bank_name) : false,
  }
}

