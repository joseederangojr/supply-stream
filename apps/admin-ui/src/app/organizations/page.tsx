import { OrganizationsTable } from "@/components/organizations/organizations-table"
import { Button } from "@supply-stream/ui"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function OrganizationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <Link href="/organizations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Organization
          </Button>
        </Link>
      </div>
      <p className="text-muted-foreground">Manage client and supplier organizations in the Supply Stream platform.</p>
      <OrganizationsTable />
    </div>
  )
}
