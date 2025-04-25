import { RequestForm } from "@/components/requests/request-form"

export default function NewRequestPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create New Request</h1>
      <p className="text-muted-foreground">
        Fill out the form below to create a new procurement request. You can add items to your request after creation.
      </p>
      <RequestForm />
    </div>
  )
}
