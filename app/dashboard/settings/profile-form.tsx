"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, Eye } from "lucide-react";
import { Icons } from "@/components/icons";
import type { ProfileFormData } from "@/types";
import { useProfile } from "@/hooks/use-profile";
import Link from "next/link";

interface ProfileFormProps {
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    profile_photo: string | null;
    bio: string | null;
    social_media?: {
      twitter?: string | null;
      facebook?: string | null;
      instagram?: string | null;
      linkedin?: string | null;
    } | null;
  };
  user: {
    id: string;
    email: string;
  };
}

export function ProfileForm({ profile, user }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || user?.email || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
    social_media: {
      twitter: profile?.social_media?.twitter || "",
      facebook: profile?.social_media?.facebook || "",
      instagram: profile?.social_media?.instagram || "",
      linkedin: profile?.social_media?.linkedin || "",
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateProfile, updateProfilePhoto, isUploading } = useProfile(
    user?.id
  );

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedProfile: ProfileFormData = {
      name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      social_media: formData.social_media,
    };

    await updateProfile(updatedProfile);

    setIsSubmitting(false);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await updateProfilePhoto(file);
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.email
      ? user.email
          .split("@")[0]
          .split(".")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/profile/${user.id}`}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Public Profile
            </Link>
          </Button>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar
                className="h-24 w-24 cursor-pointer"
                onClick={handlePhotoClick}
              >
                <AvatarImage
                  src={profile?.profile_photo || ""}
                  alt={profile?.full_name || user?.email || ""}
                />
                <AvatarFallback className="text-lg">
                  {getInitials()}
                </AvatarFallback>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePhotoClick}
              disabled={isUploading}
            >
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

          {/* Full Name */}
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

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Your email cannot be changed.
            </p>
          </div>

          {/* Phone Number */}
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

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell others about yourself and your causes"
              value={formData.bio}
              onChange={handleProfileChange}
              rows={4}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              This will be displayed on your public profile.
            </p>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Media</h3>
            <p className="text-sm text-muted-foreground">
              Add links to your social media profiles (optional)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter (X)</Label>
                <Input
                  id="twitter"
                  name="twitter"
                  placeholder="https://twitter.com/yourusername"
                  value={formData.social_media.twitter}
                  onChange={handleSocialMediaChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  name="facebook"
                  placeholder="https://facebook.com/yourpage"
                  value={formData.social_media.facebook}
                  onChange={handleSocialMediaChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  placeholder="https://instagram.com/yourusername"
                  value={formData.social_media.instagram}
                  onChange={handleSocialMediaChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.social_media.linkedin}
                  onChange={handleSocialMediaChange}
                />
              </div>
            </div>
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
  );
}
