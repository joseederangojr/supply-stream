import { UsersTable } from "@/components/users/users-table"
import { Button } from "@supply-stream/ui"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <Link href="/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New User
          </Button>
        </Link>
      </div>
      <p className="text-muted-foreground">Manage users across all organizations in the Supply Stream platform.</p>
      <UsersTable />
    </div>
  )
}
