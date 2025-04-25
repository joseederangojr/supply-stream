import { DashboardOverview } from "@/components/dashboard/overview"
import { SystemStatus } from "@/components/dashboard/system-status"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <DashboardOverview />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemStatus />
        <RecentActivity />
      </div>
    </div>
  )
}
