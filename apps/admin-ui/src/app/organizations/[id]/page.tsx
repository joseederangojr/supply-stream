import { OrganizationDetails } from "@/components/organizations/organization-details"
import { OrganizationUsers } from "@/components/organizations/organization-users"
import { Button } from "@supply-stream/ui"
import Link from "next/link"
import { Edit } from "lucide-react"

export default function OrganizationDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Organization Details</h1>
        <Link href={`/organizations/${params.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Organization
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrganizationDetails id={params.id} />
        <OrganizationUsers organizationId={params.id} />
      </div>
    </div>
  )
}
