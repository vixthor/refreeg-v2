import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Shield, UserCheck, UserX, MoreHorizontal, Search, UserCog, User } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { UserActions } from "./user-actions"
import { UserSearch } from "@/components/search"
import type { UserWithRole } from "@/types"
import { getUserRole, listUsersWithRoles } from "@/actions/role-actions"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {

  const supabase = await createClient()
  const params = await searchParams

  const { data: { user: currentuser } } = await supabase.auth.getUser()

  if (!currentuser) {
    redirect("/signin")
  }

  // Check if user is admin or manager
  const user = await getUserRole(currentuser.id)

  if (!user || (user !== "admin" && user !== "manager")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You do not have permission to access this page.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Fetch users using server action
  const users = await listUsersWithRoles()

  // Filter users based on search query if provided

  const filteredUsers = params.search
    ? users.filter(
      (user) =>
        user.email.toLowerCase().includes(params.search!.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(params.search!.toLowerCase())
    )
    : users

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground">View and manage user accounts and permissions.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Users</CardTitle>
            <UserSearch defaultValue={params.search} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((userItem: UserWithRole) => (
                    <TableRow key={userItem.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{userItem.full_name || "Unnamed User"}</span>
                          <span className="text-sm text-muted-foreground">{userItem.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {userItem.role === "admin" ? (
                          <Badge variant="default" className="bg-red-500">
                            <Shield className="mr-1 h-3 w-3" />
                            Admin
                          </Badge>
                        ) : userItem.role === "manager" ? (
                          <Badge variant="default" className="bg-blue-500">
                            <UserCog className="mr-1 h-3 w-3" />
                            Manager
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <User className="mr-1 h-3 w-3" />
                            User
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {userItem.is_blocked ? (
                          <Badge variant="destructive">Blocked</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(userItem.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <UserActions
                          user={userItem}
                          currentUserRole={user}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

