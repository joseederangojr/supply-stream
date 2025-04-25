import { RequestsTable } from "@/components/requests/requests-table"
import { Button } from "@supply-stream/ui"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Procurement Requests</h1>
        <Link href="/requests/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>
      <RequestsTable />
    </div>
  )
}
