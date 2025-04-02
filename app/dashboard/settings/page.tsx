"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Camera, Upload } from "lucide-react"
import { useProfile } from "@/hooks/use-profile"
import { useDatabaseSetup } from "@/hooks/use-database-setup"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ProfileFormData, BankDetailsFormData } from "@/types"

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    profile,
    isLoading: profileLoading,
    isUploading,
    error: profileError,
    updateProfile,
    updateProfilePhoto,
    updateBankDetails,
  } = useProfile(user?.id)
  const { isReady, missingTables, error: dbError } = useDatabaseSetup()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: "",
    phone: "",
  })
  const [bankData, setBankData] = useState<BankDetailsFormData>({
    accountNumber: "",
    bankName: "",
    accountName: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Database error message
  const databaseError =
    dbError || profileError || (!isReady ? `Missing database tables: ${missingTables.join(", ")}` : null)

  useEffect(() => {
    // Get the tab from URL if present
    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [])

  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.full_name || "",
        phone: profile.phone || "",
      })

      setBankData({
        accountNumber: profile.account_number || "",
        bankName: profile.bank_name || "",
        accountName: profile.account_name || "",
      })
    }
  }, [profile])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBankData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await updateProfile(profileData)
    setIsSubmitting(false)
  }

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await updateBankDetails(bankData)
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

  // Get initials for avatar fallback
  const getInitials = () => {
    if (profileData.name) {
      return profileData.name
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
          .map((n: any[]) => n[0])
          .join("")
          .toUpperCase()
      : "U"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and payment details.</p>
      </div>

      {databaseError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>{databaseError} Please follow the database setup instructions.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={activeTab} className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="bank">Bank Details</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
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
                      <AvatarImage src={profile?.profile_photo || ""} alt={profileData.name || user?.email || ""} />
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
                    name="name"
                    placeholder="Your full name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={user?.email || ""} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Your email cannot be changed.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Your phone number"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting || profileLoading || !!databaseError}>
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
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>Add your bank account details for receiving donations.</CardDescription>
            </CardHeader>
            <form onSubmit={handleBankSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    placeholder="Your Nigerian bank account number"
                    value={bankData.accountNumber}
                    onChange={handleBankChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    placeholder="Your bank name"
                    value={bankData.bankName}
                    onChange={handleBankChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    name="accountName"
                    placeholder="Name on your bank account"
                    value={bankData.accountName}
                    onChange={handleBankChange}
                    required
                  />
                </div>

                <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Icons.help className="h-5 w-5 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">About Bank Details</h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <p>
                          Your bank details are used to receive donations from your causes. Funds will be automatically
                          transferred to this account when donations are made.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting || profileLoading || !!databaseError}>
                  {isSubmitting ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Bank Details"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Notification settings will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {databaseError && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Database Setup Instructions</CardTitle>
            <CardDescription>
              Run the following SQL in your Supabase SQL Editor to create the required tables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {`-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  account_number TEXT,
  bank_name TEXT,
  account_name TEXT,
  profile_photo TEXT,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create causes table
CREATE TABLE public.causes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  goal DECIMAL NOT NULL,
  raised DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  image TEXT
);

-- Create donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cause_id UUID REFERENCES public.causes(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'completed',
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create roles table
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create policies for causes
CREATE POLICY "Anyone can view approved causes" 
  ON public.causes FOR SELECT 
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own causes" 
  ON public.causes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own causes" 
  ON public.causes FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for donations
CREATE POLICY "Anyone can view donations for approved causes" 
  ON public.donations FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.causes 
    WHERE causes.id = donations.cause_id 
    AND (causes.status = 'approved' OR causes.user_id = auth.uid())
  ));

CREATE POLICY "Anyone can insert donations" 
  ON public.donations FOR INSERT 
  WITH CHECK (true);

-- Create policies for roles
CREATE POLICY "Admins can manage roles" 
  ON public.roles 
  USING (
    EXISTS (
      SELECT 1 FROM public.roles 
      WHERE roles.user_id = auth.uid() 
      AND roles.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own role" 
  ON public.roles FOR SELECT 
  USING (user_id = auth.uid());

-- Create function to update cause raised amount when donation is added
CREATE OR REPLACE FUNCTION update_cause_raised_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.causes
  SET raised = raised + NEW.amount
  WHERE id = NEW.cause_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update cause raised amount
CREATE TRIGGER update_cause_raised_amount_trigger
AFTER INSERT ON public.donations
FOR EACH ROW
EXECUTE FUNCTION update_cause_raised_amount();`}
            </pre>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              After running this SQL, refresh this page to continue setting up your profile.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

