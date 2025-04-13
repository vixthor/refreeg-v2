import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DonationForm } from "@/components/donation-form"
import { DonorsList } from "@/components/donors-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCause, getCurrentUser, getProfile, listDonationsForCause } from "@/actions"
import { notFound } from "next/navigation"

// Mock data for a cause
const mockCause = {
  id: "1",
  title: "Clean Water Initiative",
  description:
    "Providing clean water to communities in rural areas. Access to clean water is a fundamental human right, yet millions of people around the world still lack this basic necessity. This initiative aims to install water purification systems in communities that currently rely on contaminated water sources, reducing waterborne diseases and improving overall health outcomes. Your donation will directly fund the purchase and installation of water filters, the construction of wells, and educational programs on water hygiene and conservation.",
  category: "Environment",
  raised: 12500,
  goal: 20000,
  image: "/placeholder.svg?height=300&width=600",
  user: {
    name: "Environmental Action Group",
    email: "contact@example.org",
  },
  created_at: "2023-05-15T10:30:00Z",
  status: "approved",
}

// Mock donors data
const mockDonors = [
  { id: "1", name: "John Doe", amount: 500, date: "2023-06-01T14:30:00Z", message: "Keep up the great work!" },
  { id: "2", name: "Anonymous", amount: 1000, date: "2023-06-02T09:15:00Z", message: null },
  { id: "3", name: "Sarah Johnson", amount: 250, date: "2023-06-03T16:45:00Z", message: "Happy to support this cause" },
  { id: "4", name: "Anonymous", amount: 5000, date: "2023-06-04T11:20:00Z", message: "Water is life" },
  { id: "5", name: "Michael Brown", amount: 750, date: "2023-06-05T13:10:00Z", message: null },
]

export default async function CauseDetailPage({ params }: { params: { id: string } }) {
  const myparams = await params
  const cause = await getCause(myparams.id)
  if (!cause) {
    notFound()
  }
  // Use mock data for now
  // const cause = mockCause
  const donors = await listDonationsForCause(cause.id)

  // Format the date
  const formattedDate = new Date(cause.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Calculate percentage raised
  const percentRaised = Math.min(Math.round((cause.raised / cause.goal) * 100), 100)
  const user = await getCurrentUser()
  const myprofile = user ? await getProfile(user.id) : undefined
  const profile = {
    email: myprofile?.email || "",
    name: myprofile?.full_name || "",
  }

  return (
    <div className="container py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <img src={cause.image || "/placeholder.svg"} alt={cause.title} className="object-cover w-full h-full" />
          </div>

          <Tabs defaultValue="about">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="donors">Donors</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="space-y-4">
              <h1 className="text-3xl font-bold">{cause.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Created by {cause.user.name}</span>
                <span>•</span>
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="capitalize">{cause.category}</span>
              </div>
              <p className="whitespace-pre-line">{cause.description}</p>
            </TabsContent>
            <TabsContent value="donors">
              <DonorsList donors={donors} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Donation Progress</CardTitle>
              <CardDescription>Help us reach our goal of ₦{cause.goal.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">₦{cause.raised.toLocaleString()}</span>
                  <span className="text-muted-foreground">of ₦{cause.goal.toLocaleString()}</span>
                </div>
                <Progress value={percentRaised} />
                <div className="text-sm text-muted-foreground text-right">{percentRaised}% raised</div>
              </div>

              <div className="text-sm">
                <div className="flex justify-between py-1">
                  <span>Total donors</span>
                  <span className="font-medium">{donors.length}</span>
                </div>
                <div className="flex justify-between py-1 border-t">
                  <span>Days active</span>
                  <span className="font-medium">30</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <DonationForm causeId={cause.id} profile={profile} />
        </div>
      </div>
    </div>
  )
}

