"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Textarea,
  Select,
  Button,
  Card,
  CardContent,
} from "@supply-stream/ui"

interface FormData {
  title: string
  description: string
  totalBudget: string
  costCenter: string
  urgency: string
  deliveryAddress: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  desiredDeliveryDate: string
}

export function RequestForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    totalBudget: "",
    costCenter: "",
    urgency: "MEDIUM",
    deliveryAddress: {
      street: "",
      city: "",
      postalCode: "",
      country: "",
    },
    desiredDeliveryDate: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title) newErrors.title = "Title is required"
    if (!formData.description) newErrors.description = "Description is required"
    if (!formData.totalBudget) newErrors.totalBudget = "Budget is required"
    if (!formData.deliveryAddress.street) newErrors["deliveryAddress.street"] = "Street is required"
    if (!formData.deliveryAddress.city) newErrors["deliveryAddress.city"] = "City is required"
    if (!formData.deliveryAddress.postalCode) newErrors["deliveryAddress.postalCode"] = "Postal code is required"
    if (!formData.deliveryAddress.country) newErrors["deliveryAddress.country"] = "Country is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // This would be an API call in a real application
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to the requests page after successful creation
      router.push("/requests")
    } catch (error) {
      console.error("Error creating request:", error)
      setErrors({ form: "Failed to create request. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormItem>
              <FormLabel htmlFor="title">Title</FormLabel>
              <FormControl>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={errors.title ? "border-red-500" : ""}
                />
              </FormControl>
              {errors.title && <FormMessage>{errors.title}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="totalBudget">Total Budget ($)</FormLabel>
              <FormControl>
                <Input
                  id="totalBudget"
                  name="totalBudget"
                  type="number"
                  value={formData.totalBudget}
                  onChange={handleChange}
                  className={errors.totalBudget ? "border-red-500" : ""}
                />
              </FormControl>
              {errors.totalBudget && <FormMessage>{errors.totalBudget}</FormMessage>}
            </FormItem>
          </div>

          <FormItem>
            <FormLabel htmlFor="description">Description</FormLabel>
            <FormControl>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
            </FormControl>
            {errors.description && <FormMessage>{errors.description}</FormMessage>}
          </FormItem>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormItem>
              <FormLabel htmlFor="costCenter">Cost Center</FormLabel>
              <FormControl>
                <Input id="costCenter" name="costCenter" value={formData.costCenter} onChange={handleChange} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="urgency">Urgency</FormLabel>
              <FormControl>
                <Select id="urgency" name="urgency" value={formData.urgency} onChange={handleChange}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </Select>
              </FormControl>
            </FormItem>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">Delivery Address</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormItem>
                <FormLabel htmlFor="deliveryAddress.street">Street</FormLabel>
                <FormControl>
                  <Input
                    id="deliveryAddress.street"
                    name="deliveryAddress.street"
                    value={formData.deliveryAddress.street}
                    onChange={handleChange}
                    className={errors["deliveryAddress.street"] ? "border-red-500" : ""}
                  />
                </FormControl>
                {errors["deliveryAddress.street"] && <FormMessage>{errors["deliveryAddress.street"]}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel htmlFor="deliveryAddress.city">City</FormLabel>
                <FormControl>
                  <Input
                    id="deliveryAddress.city"
                    name="deliveryAddress.city"
                    value={formData.deliveryAddress.city}
                    onChange={handleChange}
                    className={errors["deliveryAddress.city"] ? "border-red-500" : ""}
                  />
                </FormControl>
                {errors["deliveryAddress.city"] && <FormMessage>{errors["deliveryAddress.city"]}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel htmlFor="deliveryAddress.postalCode">Postal Code</FormLabel>
                <FormControl>
                  <Input
                    id="deliveryAddress.postalCode"
                    name="deliveryAddress.postalCode"
                    value={formData.deliveryAddress.postalCode}
                    onChange={handleChange}
                    className={errors["deliveryAddress.postalCode"] ? "border-red-500" : ""}
                  />
                </FormControl>
                {errors["deliveryAddress.postalCode"] && (
                  <FormMessage>{errors["deliveryAddress.postalCode"]}</FormMessage>
                )}
              </FormItem>

              <FormItem>
                <FormLabel htmlFor="deliveryAddress.country">Country</FormLabel>
                <FormControl>
                  <Input
                    id="deliveryAddress.country"
                    name="deliveryAddress.country"
                    value={formData.deliveryAddress.country}
                    onChange={handleChange}
                    className={errors["deliveryAddress.country"] ? "border-red-500" : ""}
                  />
                </FormControl>
                {errors["deliveryAddress.country"] && <FormMessage>{errors["deliveryAddress.country"]}</FormMessage>}
              </FormItem>
            </div>
          </div>

          <FormItem>
            <FormLabel htmlFor="desiredDeliveryDate">Desired Delivery Date</FormLabel>
            <FormControl>
              <Input
                id="desiredDeliveryDate"
                name="desiredDeliveryDate"
                type="date"
                value={formData.desiredDeliveryDate}
                onChange={handleChange}
              />
            </FormControl>
          </FormItem>

          {errors.form && <FormMessage>{errors.form}</FormMessage>}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push("/requests")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Request"}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}
