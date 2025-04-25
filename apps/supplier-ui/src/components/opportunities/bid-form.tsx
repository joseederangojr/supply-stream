"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Textarea,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@supply-stream/ui"
import { Package, DollarSign } from "lucide-react"

interface BidFormProps {
  opportunityId: string
}

// Mock data for demonstration
const mockOpportunityItems = [
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
]

interface ItemBid {
  itemId: string
  unitPrice: string
  notes: string
}

interface BidFormData {
  opportunityId: string
  itemBids: Record<string, ItemBid>
  notes: string
}

export function BidForm({ opportunityId }: BidFormProps) {
  const router = useRouter()
  const [items, setItems] = useState(mockOpportunityItems)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<BidFormData>({
    opportunityId,
    itemBids: {},
    notes: "",
  })

  useEffect(() => {
    // Simulate API call to fetch opportunity items
    const fetchOpportunityItems = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Initialize form data with empty values for each item
        const initialItemBids: Record<string, ItemBid> = {}
        mockOpportunityItems.forEach((item) => {
          initialItemBids[item.id] = {
            itemId: item.id,
            unitPrice: "",
            notes: "",
          }
        })

        setFormData((prev) => ({
          ...prev,
          itemBids: initialItemBids,
        }))

        setItems(mockOpportunityItems)
      } catch (error) {
        console.error("Error fetching opportunity items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunityItems()
  }, [opportunityId])

  const handleItemChange = (itemId: string, field: keyof ItemBid, value: string) => {
    setFormData((prev) => ({
      ...prev,
      itemBids: {
        ...prev.itemBids,
        [itemId]: {
          ...prev.itemBids[itemId],
          [field]: value,
        },
      },
    }))

    // Clear error for this field if it exists
    if (errors[`${itemId}.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[`${itemId}.${field}`]
        return newErrors
      })
    }
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      notes: e.target.value,
    }))
  }

  const calculateTotalBid = (): number => {
    let total = 0
    items.forEach((item) => {
      const bid = formData.itemBids[item.id]
      if (bid && bid.unitPrice) {
        const unitPrice = Number.parseFloat(bid.unitPrice)
        if (!isNaN(unitPrice)) {
          total += unitPrice * item.quantity
        }
      }
    })
    return total
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    items.forEach((item) => {
      const bid = formData.itemBids[item.id]
      if (!bid || !bid.unitPrice) {
        newErrors[`${item.id}.unitPrice`] = "Unit price is required"
      } else if (isNaN(Number.parseFloat(bid.unitPrice)) || Number.parseFloat(bid.unitPrice) <= 0) {
        newErrors[`${item.id}.unitPrice`] = "Unit price must be a positive number"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      // In a real app, this would be an API call
      console.log("Submitting bid:", formData)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to bids page after successful submission
      router.push("/bids")
    } catch (error) {
      console.error("Error submitting bid:", error)
      setErrors({ form: "Failed to submit bid. Please try again." })
    } finally {
      setSubmitting(false)
    }
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

  return (
    <Form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Items to Bid On
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="border rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Quantity:</span> {item.quantity} {item.unitOfMeasure}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Budget:</span> {formatCurrency(item.budget)}
                    </div>
                  </div>
                  <div>
                    <FormItem>
                      <FormLabel htmlFor={`${item.id}-unitPrice`}>Your Unit Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          id={`${item.id}-unitPrice`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.itemBids[item.id]?.unitPrice || ""}
                          onChange={(e) => handleItemChange(item.id, "unitPrice", e.target.value)}
                          className={errors[`${item.id}.unitPrice`] ? "border-red-500" : ""}
                        />
                      </FormControl>
                      {errors[`${item.id}.unitPrice`] && <FormMessage>{errors[`${item.id}.unitPrice`]}</FormMessage>}
                    </FormItem>
                    <FormItem className="mt-2">
                      <FormLabel htmlFor={`${item.id}-notes`}>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          id={`${item.id}-notes`}
                          rows={2}
                          value={formData.itemBids[item.id]?.notes || ""}
                          onChange={(e) => handleItemChange(item.id, "notes", e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Bid Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">Total Bid Amount:</span>
              <span className="text-xl font-bold">{formatCurrency(calculateTotalBid())}</span>
            </div>
            <FormItem>
              <FormLabel htmlFor="notes">Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  id="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleNotesChange}
                  placeholder="Add any additional information about your bid, delivery capabilities, or special terms..."
                />
              </FormControl>
            </FormItem>
          </div>
        </CardContent>
      </Card>

      {errors.form && <FormMessage>{errors.form}</FormMessage>}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.push(`/opportunities/${opportunityId}`)}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Bid"}
        </Button>
      </div>
    </Form>
  )
}
