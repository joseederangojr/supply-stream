"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@supply-stream/ui"
import { Eye, FileText } from "lucide-react"

// Mock data for demonstration
const mockRequests = [
  {
    id: "1",
    requisitionNumber: "REQ-001",
    title: "Office Supplies",
    status: "PUBLISHED",
    totalBudget: 1200,
    createdAt: "2023-11-10T10:30:00Z",
    itemCount: 5,
    bidCount: 3,
  },
  {
    id: "2",
    requisitionNumber: "REQ-002",
    title: "IT Equipment",
    status: "DRAFT",
    totalBudget: 5000,
    createdAt: "2023-11-09T14:20:00Z",
    itemCount: 8,
    bidCount: 0,
  },
  {
    id: "3",
    requisitionNumber: "REQ-003",
    title: "Marketing Materials",
    status: "IN_PROGRESS",
    totalBudget: 3500,
    createdAt: "2023-11-08T09:15:00Z",
    itemCount: 12,
    bidCount: 5,
  },
  {
    id: "4",
    requisitionNumber: "REQ-004",
    title: "Catering Services",
    status: "COMPLETED",
    totalBudget: 2000,
    createdAt: "2023-11-05T16:45:00Z",
    itemCount: 3,
    bidCount: 4,
  },
]

export function RequestsTable() {
  const [requests] = useState(mockRequests)

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800"
      case "PUBLISHED":
        return "bg-blue-100 text-blue-800"
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Requisition #</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Budget</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Bids</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-b">
                  <td className="px-4 py-4 text-sm">{request.requisitionNumber}</td>
                  <td className="px-4 py-4 text-sm font-medium">{request.title}</td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(request.status)}`}
                    >
                      {request.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">{formatCurrency(request.totalBudget)}</td>
                  <td className="px-4 py-4 text-sm">{formatDate(request.createdAt)}</td>
                  <td className="px-4 py-4 text-sm">{request.itemCount}</td>
                  <td className="px-4 py-4 text-sm">{request.bidCount}</td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex space-x-2">
                      <Link href={`/requests/${request.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/requests/${request.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </Link>
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
