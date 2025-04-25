"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@supply-stream/ui"
import { Eye, MapPin, Calendar, DollarSign } from "lucide-react"

// Mock data for demonstration
const mockOpportunities = [
  {
    id: "1",
    requisitionNumber: "REQ-001",
    title: "Office Supplies",
    clientName: "Acme Corp",
    location: "New York, NY",
    totalBudget: 1200,
    publishedDate: "2023-11-10T10:30:00Z",
    closingDate: "2023-11-25T23:59:59Z",
    itemCount: 5,
    distance: 3.2,
  },
  {
    id: "2",
    requisitionNumber: "REQ-003",
    title: "Marketing Materials",
    clientName: "TechStart Inc",
    location: "Boston, MA",
    totalBudget: 3500,
    publishedDate: "2023-11-08T09:15:00Z",
    closingDate: "2023-11-22T23:59:59Z",
    itemCount: 12,
    distance: 28.7,
  },
  {
    id: "3",
    requisitionNumber: "REQ-005",
    title: "IT Hardware",
    clientName: "Global Finance",
    location: "Chicago, IL",
    totalBudget: 8500,
    publishedDate: "2023-11-12T14:20:00Z",
    closingDate: "2023-11-30T23:59:59Z",
    itemCount: 8,
    distance: 15.3,
  },
  {
    id: "4",
    requisitionNumber: "REQ-007",
    title: "Catering Services",
    clientName: "EventPro LLC",
    location: "Miami, FL",
    totalBudget: 2000,
    publishedDate: "2023-11-11T11:45:00Z",
    closingDate: "2023-11-20T23:59:59Z",
    itemCount: 3,
    distance: 42.1,
  },
]

export function OpportunitiesTable() {
  const [opportunities] = useState(mockOpportunities)

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
        <CardTitle>Available Opportunities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Requisition #</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Budget</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Closing Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opportunity) => (
                <tr key={opportunity.id} className="border-b">
                  <td className="px-4 py-4 text-sm">{opportunity.requisitionNumber}</td>
                  <td className="px-4 py-4 text-sm font-medium">{opportunity.title}</td>
                  <td className="px-4 py-4 text-sm">{opportunity.clientName}</td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                      <span>{opportunity.location}</span>
                      <span className="ml-1 text-xs text-muted-foreground">({opportunity.distance} mi)</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">{formatCurrency(opportunity.totalBudget)}</td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                      <span>{formatDate(opportunity.closingDate)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">{opportunity.itemCount}</td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex space-x-2">
                      <Link href={`/opportunities/${opportunity.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/opportunities/${opportunity.id}/bid`}>
                        <Button size="sm">
                          <DollarSign className="mr-1 h-4 w-4" />
                          Bid
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
