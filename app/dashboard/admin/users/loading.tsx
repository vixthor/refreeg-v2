import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground">Loading user management...</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loading</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    </div>
  )
}

