"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@supply-stream/ui"
import { Building, MapPin, Globe, Phone, Mail, Calendar, CheckCircle, XCircle } from "lucide-react"

interface OrganizationDetailsProps {
  id: string
}

// Mock data for demonstration
const mockOrganizationDetails = {
  id: "1",
  name: "Acme Corp",
  type: "CLIENT",
  legalRegistration: "US123456789",
  taxId: "87-1234567",
  industry: "Technology",
  address: {
    street: "123 Tech Avenue",
    city: "New York",
    postalCode: "10001",
    country: "USA",
  },
  website: "https://acmecorp.example.com",
  phone: "+1 (555) 123-4567",
  email: "contact@acmecorp.example.com",
  companySize: "100-500",
  yearsInBusiness: "10+",
  isVerified: true,
  verificationDate: "2023-02-15T10:30:00Z",
  createdAt: "2023-01-15T10:30:00Z",
}

export function OrganizationDetails({ id }: OrganizationDetailsProps) {
  const [organization, setOrganization] = useState<typeof mockOrganizationDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchOrganization = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        setOrganization(mockOrganizationDetails)
      } catch (error) {
        console.error("Error fetching organization details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganization()
  }, [id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!organization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-muted-foreground">Organization not found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{organization.name}</h2>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  organization.type === "CLIENT" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                }`}
              >
                {organization.type}
              </span>
              {organization.isVerified ? (
                <span className="inline-flex items-center text-green-600 text-xs">
                  <CheckCircle className="mr-1 h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center text-red-600 text-xs">
                  <XCircle className="mr-1 h-3 w-3" /> Not Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Basic Information</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-2">Industry:</span> {organization.industry}
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-2">Address:</span>{" "}
                {`${organization.address.street}, ${organization.address.city}, ${organization.address.postalCode}, ${organization.address.country}`}
              </div>
              <div className="flex items-center text-sm">
                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-2">Website:</span>{" "}
                <a
                  href={organization.website}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {organization.website}
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-2">Phone:</span> {organization.phone}
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-2">Email:</span>{" "}
                <a href={`mailto:${organization.email}`} className="text-primary hover:underline">
                  {organization.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Company Details</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="font-medium mr-2">Legal Registration:</span> {organization.legalRegistration}
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium mr-2">Tax ID:</span> {organization.taxId}
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium mr-2">Company Size:</span> {organization.companySize}
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium mr-2">Years in Business:</span> {organization.yearsInBusiness}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">System Information</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-2">Created:</span> {formatDate(organization.createdAt)}
              </div>
              {organization.isVerified && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium mr-2">Verified on:</span> {formatDate(organization.verificationDate)}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
