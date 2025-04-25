"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@supply-stream/ui"
import { Eye, Edit, Trash, CheckCircle, XCircle } from "lucide-react"

// Mock data for demonstration
const mockOrganizations = [
  {
    id: "1",
    name: "Acme Corp",
    type: "CLIENT",
    industry: "Technology",
    location: "New York, NY",
    users: 24,
    isVerified: true,
    createdAt: "2023-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "TechStart Inc",
    type: "CLIENT",
    industry: "Software",
    location: "San Francisco, CA",
    users: 18,
    isVerified: true,
    createdAt: "2023-02-20T14:45:00Z",
  },
  {
    id: "3",
    name: "Global Supplies Ltd",
    type: "SUPPLIER",
    industry: "Manufacturing",
    location: "Chicago, IL",
    users: 12,
    isVerified: true,
    createdAt: "2023-03-10T09:15:00Z",
  },
  {
    id: "4",
    name: "Innovative Solutions",
    type: "SUPPLIER",
    industry: "Consulting",
    location: "Boston, MA",
    users: 8,
    isVerified: false,
    createdAt: "2023-04-05T16:20:00Z",
  },
  {
    id: "5",
    name: "EcoFriendly Products",
    type: "SUPPLIER",
    industry: "Retail",
    location: "Portland, OR",
    users: 6,
    isVerified: true,
    createdAt: "2023-05-12T11:10:00Z",
  },
]

export function OrganizationsTable() {
  const [organizations] = useState(mockOrganizations)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Organizations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Industry</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Users</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Verified</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id} className="border-b">
                  <td className="px-4 py-4 text-sm font-medium">{org.name}</td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        org.type === "CLIENT" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {org.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">{org.industry}</td>
                  <td className="px-4 py-4 text-sm">{org.location}</td>
                  <td className="px-4 py-4 text-sm">{org.users}</td>
                  <td className="px-4 py-4 text-sm">
                    {org.isVerified ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">{formatDate(org.createdAt)}</td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex space-x-2">
                      <Link href={`/organizations/${org.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/organizations/${org.id}/edit`}>
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
