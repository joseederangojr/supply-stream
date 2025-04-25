import { BidForm } from "@/components/opportunities/bid-form"

export default function SubmitBidPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Submit Bid</h1>
      <p className="text-muted-foreground">
        Review the opportunity details and submit your bid by providing pricing for each item.
      </p>
      <BidForm opportunityId={params.id} />
    </div>
  )
}
