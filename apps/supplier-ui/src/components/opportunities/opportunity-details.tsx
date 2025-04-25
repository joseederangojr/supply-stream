"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@supply-stream/ui"
import { MapPin, Calendar, DollarSign, Info, Truck } from "lucide-react"

interface OpportunityDetailsProps {
  id: string
}

// Mock data for demonstration
const mockOpportunityDetails = {
  id: "1",
  requisitionNumber: "REQ-001",
  title: "Office Supplies",
  description:
    "We are looking for a supplier to provide various office supplies for our headquarters. Items include paper, pens, notebooks, and other stationery items. We prefer eco-friendly products where possible.",
  clientName: "Acme Corp",
  clientIndustry: "Technology",
  location: "New York, NY",
  deliveryAddress: "123 Business Ave, New York, NY 10001",
  totalBudget: 1200,
  publishedDate: "2023-11-10T10:30:00Z",
  closingDate: "2023-11-25T23:59:59Z",
  desiredDeliveryDate: "2023-12-15T00:00:00Z",
  items: [
    {
      id: "item1",
      name: "Copy Paper",
      description: "A4 size, 80gsm, white copy paper",
      quantity: 50,
      unitOfMeasure: "Reams",
      budget: 250,
    },
    {
      id: "item2",
      name: "Ballpoint Pens",
      description: "Blue ink, medium point ballpoint pens",
      quantity: 100,
      unitOfMeasure: "Boxes",
      budget: 300,
    },
    {
      id: "item3",
      name: "Notebooks",
      description: "Spiral-bound, A5 size notebooks, lined",
      quantity: 75,
      unitOfMeasure: "Units",
      budget: 375,
    },
    {
      id: "item4",
      name: "Sticky Notes",
      description: "3x3 inch, assorted colors",
      quantity: 30,
      unitOfMeasure: "Packs",
      budget: 150,
    },
    {
      id: "item5",
      name: "Staplers",
      description: "Desktop staplers with staple remover",
      quantity: 25,
      unitOfMeasure: "Units",
      budget: 125,
    },
  ],
}

export function OpportunityDetails({ id }: OpportunityDetailsProps) {
  const [opportunity, setOpportunity] = useState<typeof mockOpportunityDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchOpportunity = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        setOpportunity(mockOpportunityDetails)
      } catch (error) {
        console.error("Error fetching opportunity details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunity()
  }, [id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-muted-foreground">Opportunity not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{opportunity.title}</CardTitle>
          <div className="text-sm text-muted-foreground">Requisition #{opportunity.requisitionNumber}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Client Information</h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <Info className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{opportunity.clientName}</div>
                    <div className="text-sm text-muted-foreground">{opportunity.clientIndustry}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Delivery Location</div>
                    <div className="text-sm text-muted-foreground">{opportunity.deliveryAddress}</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Timeline</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium">Published:</span> {formatDate(opportunity.publishedDate)}
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium">Closing Date:</span> {formatDate(opportunity.closingDate)}
                  </div>
                </div>
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium">Desired Delivery:</span> {formatDate(opportunity.desiredDeliveryDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Description</h3>
            <p className="text-sm">{opportunity.description}</p>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              <h3 className="text-sm font-medium">Total Budget: {formatCurrency(opportunity.totalBudget)}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Items ({opportunity.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Item</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Budget</th>
                </tr>
              </thead>
              <tbody>
                {opportunity.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-4 text-sm font-medium">{item.name}</td>
                    <td className="px-4 py-4 text-sm">{item.description}</td>
                    <td className="px-4 py-4 text-sm">{item.quantity}</td>
                    <td className="px-4 py-4 text-sm">{item.unitOfMeasure}</td>
                    <td className="px-4 py-4 text-sm">{formatCurrency(item.budget)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
