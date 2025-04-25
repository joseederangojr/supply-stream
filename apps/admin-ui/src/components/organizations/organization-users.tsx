"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@supply-stream/ui"
import { User, Mail, Calendar, Shield, Edit } from "lucide-react"

interface OrganizationUsersProps {
  organizationId: string
}

// Mock data for demonstration
const mockUsers = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@acmecorp.example.com",
    role: "ADMIN",
    lastLogin: "2023-11-14T09:30:00Z",
    isActive: true,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@acmecorp.example.com",
    role: "USER",
    lastLogin: "2023-11-15T10:45:00Z",
    isActive: true,
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael.brown@acmecorp.example.com",
    role: "USER",
    lastLogin: "2023-11-13T14:20:00Z",
    isActive: true,
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@acmecorp.example.com",
    role: "USER",
    lastLogin: "2023-11-10T11:15:00Z",
    isActive: false,
  },
]

export function OrganizationUsers({ organizationId }: OrganizationUsersProps) {
  const [users, setUsers] = useState<typeof mockUsers>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchUsers = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 700))
        setUsers(mockUsers)
      } catch (error) {
        console.error("Error fetching organization users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [organizationId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800"
      case "USER":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Users</CardTitle>
        <Link href={`/organizations/${organizationId}/users/new`}>
          <Button size="sm">Add User</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-start justify-between border-b pb-4">
              <div className="flex items-start space-x-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    user.isActive ? "bg-primary/10" : "bg-gray-200"
                  }`}
                >
                  <User className={`h-5 w-5 ${user.isActive ? "text-primary" : "text-gray-400"}`} />
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-1 h-3 w-3" />
                    {user.email}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRoleBadgeClass(
                        user.role,
                      )}`}
                    >
                      <Shield className="mr-1 h-3 w-3" />
                      {user.role}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      <Calendar className="inline mr-1 h-3 w-3" />
                      Last login: {formatDate(user.lastLogin)}
                    </span>
                  </div>
                </div>
              </div>
              <Link href={`/users/${user.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
