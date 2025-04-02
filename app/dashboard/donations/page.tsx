import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MyDonationsList } from "@/components/my-donations-list"

export default async function MyDonationsPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/signin")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Donations</h1>
        <p className="text-muted-foreground">Track all your donations and their impact.</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Donations</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <MyDonationsList userId={user.id} />
        </TabsContent>
        <TabsContent value="recent" className="space-y-4">
          <MyDonationsList userId={user.id} timeframe="recent" />
        </TabsContent>
        <TabsContent value="receipts" className="space-y-4">
          <MyDonationsList userId={user.id} showReceipts={true} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

