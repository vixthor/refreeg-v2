"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload } from "lucide-react"
import { Icons } from "@/components/icons"
import type { ProfileFormData } from "@/types"
import { useProfile } from "@/hooks/use-profile"

interface ProfileFormProps {
    profile: {
        full_name: string | null
        email: string | null
        phone: string | null
        profile_photo: string | null
    }
    user: {
        id: string
        email: string
    }
}

export function ProfileForm({ profile, user }: ProfileFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        email:  profile?.email ||user?.email || '',
        phone: profile?.phone || ''
    })
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { updateProfile, updateProfilePhoto, isUploading } = useProfile(user?.id)

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
       
    }

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        const updatedProfile: ProfileFormData = {
            name: formData.full_name,
            email: formData.email,
            phone: formData.phone
        }
        await updateProfile(updatedProfile)
        setIsSubmitting(false)
    }

    const handlePhotoClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            await updateProfilePhoto(file)
        }
    }

    const getInitials = () => {
        if (profile?.full_name) {
            return profile.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2)
        }
        return user?.email
            ? user.email
                .split("@")[0]
                .split(".")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : "U"
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit}>
                <CardContent className="space-y-6">
                    {/* Profile Photo */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24 cursor-pointer" onClick={handlePhotoClick}>
                                <AvatarImage src={profile?.profile_photo || ""} alt={profile?.full_name || user?.email || ""} />
                                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                            </Avatar>
                            <div
                                className="absolute bottom-0 right-0 rounded-full bg-secondary p-1 cursor-pointer"
                                onClick={handlePhotoClick}
                            >
                                <Camera className="h-4 w-4 text-secondary-foreground" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={handlePhotoClick} disabled={isUploading}>
                            {isUploading ? (
                                <>
                                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Change Photo
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="full_name"
                            placeholder="Your full name"
                            value={formData.full_name}
                            onChange={handleProfileChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">Your email cannot be changed.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            placeholder="Your phone number"
                            value={formData.phone}
                            onChange={handleProfileChange}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
} 