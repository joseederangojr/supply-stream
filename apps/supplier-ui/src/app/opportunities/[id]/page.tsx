import { OpportunityDetails } from "@/components/opportunities/opportunity-details"
import { Button } from "@supply-stream/ui"
import Link from "next/link"
import { DollarSign } from "lucide-react"

export default function OpportunityDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Opportunity Details</h1>
        <Link href={`/opportunities/${params.id}/bid`}>
          <Button>
            <DollarSign className="mr-2 h-4 w-4" />
            Submit Bid
          </Button>
        </Link>
      </div>
      <OpportunityDetails id={params.id} />
    </div>
  )
}
