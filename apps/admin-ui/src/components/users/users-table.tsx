"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@supply-stream/ui"
import { Eye, Edit, Trash, CheckCircle, XCircle, Shield, Building } from "lucide-react"

// Mock data for demonstration
const mockUsers = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@acmecorp.example.com",
    organization: "Acme Corp",
    organizationId: "1",
    role: "CLIENT_ADMIN",
    lastLogin: "2023-11-14T09:30:00Z",
    isActive: true,
    createdAt: "2023-01-20T10:30:00Z",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@acmecorp.example.com",
    organization: "Acme Corp",
    organizationId: "1",
    role: "CLIENT_USER",
    lastLogin: "2023-11-15T10:45:00Z",
    isActive: true,
    createdAt: "2023-02-15T14:20:00Z",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael.brown@techstart.example.com",
    organization: "TechStart Inc",
    organizationId: "2",
    role: "CLIENT_ADMIN",
    lastLogin: "2023-11-13T14:20:00Z",
    isActive: true,
    createdAt: "2023-03-10T09:15:00Z",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@globalsupplies.example.com",
    organization: "Global Supplies Ltd",
    organizationId: "3",
    role: "SUPPLIER_ADMIN",
    lastLogin: "2023-11-10T11:15:00Z",
    isActive: true,
    createdAt: "2023-04-05T16:20:00Z",
  },
  {
    id: "5",
    name: "David Wilson",
    email: "david.wilson@innovative.example.com",
    organization: "Innovative Solutions",
    organizationId: "4",
    role: "SUPPLIER_USER",
    lastLogin: "2023-11-08T15:30:00Z",
    isActive: false,
    createdAt: "2023-05-12T11:10:00Z",
  },
  {
    id: "6",
    name: "Jessica Taylor",
    email: "jessica.taylor@system.example.com",
    organization: "System",
    organizationId: "0",
    role: "ADMIN",
    lastLogin: "2023-11-15T08:45:00Z",
    isActive: true,
    createdAt: "2023-01-01T00:00:00Z",
  },
]

export function UsersTable() {
  const [users] = useState(mockUsers)

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
      case "CLIENT_ADMIN":
        return "bg-blue-100 text-blue-800"
      case "CLIENT_USER":
        return "bg-blue-50 text-blue-600"
      case "SUPPLIER_ADMIN":
        return "bg-green-100 text-green-800"
      case "SUPPLIER_USER":
        return "bg-green-50 text-green-600"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Organization</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Last Login</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="px-4 py-4 text-sm font-medium">{user.name}</td>
                  <td className="px-4 py-4 text-sm">{user.email}</td>
                  <td className="px-4 py-4 text-sm">
                    <Link
                      href={`/organizations/${user.organizationId}`}
                      className="flex items-center text-primary hover:underline"
                    >
                      <Building className="mr-1 h-3 w-3" />
                      {user.organization}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeClass(
                        user.role,
                      )}`}
                    >
                      <Shield className="mr-1 h-3 w-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {user.isActive ? (
                      <span className="inline-flex items-center text-green-600 text-xs">
                        <CheckCircle className="mr-1 h-4 w-4" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-600 text-xs">
                        <XCircle className="mr-1 h-4 w-4" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">{formatDate(user.lastLogin)}</td>
                  <td className="px-4 py-4 text-sm">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex space-x-2">
                      <Link href={`/users/${user.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/users/${user.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
