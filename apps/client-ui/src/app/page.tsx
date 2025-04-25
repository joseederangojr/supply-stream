import { DashboardOverview } from "@/components/dashboard/overview"

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <DashboardOverview />
    </div>
  )
}
