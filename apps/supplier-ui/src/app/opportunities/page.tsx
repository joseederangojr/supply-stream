import { OpportunitiesTable } from "@/components/opportunities/opportunities-table"

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Opportunities</h1>
      </div>
      <p className="text-muted-foreground">
        Browse available procurement requests that match your company's capabilities and submit bids.
      </p>
      <OpportunitiesTable />
    </div>
  )
}
