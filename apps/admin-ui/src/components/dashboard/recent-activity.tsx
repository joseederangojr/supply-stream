import { Card, CardContent, CardHeader, CardTitle } from "@supply-stream/ui"

const activities = [
  {
    id: 1,
    type: "user_created",
    description: "New user registered: John Smith",
    timestamp: "2023-11-15T10:30:00Z",
  },
  {
    id: 2,
    type: "organization_updated",
    description: "Acme Corp updated their profile",
    timestamp: "2023-11-15T09:45:00Z",
  },
  {
    id: 3,
    type: "request_published",
    description: "New procurement request published by TechStart Inc",
    timestamp: "2023-11-15T09:15:00Z",
  },
  {
    id: 4,
    type: "bid_accepted",
    description: "Bid accepted for Office Supplies request",
    timestamp: "2023-11-15T08:30:00Z",
  },
  {
    id: 5,
    type: "user_role_changed",
    description: "User role changed for Sarah Johnson",
    timestamp: "2023-11-14T16:45:00Z",
  },
  {
    id: 6,
    type: "system_backup",
    description: "System backup completed successfully",
    timestamp: "2023-11-14T12:00:00Z",
  },
]

export function RecentActivity() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_created":
        return "👤"
      case "organization_updated":
        return "🏢"
      case "request_published":
        return "📄"
      case "bid_accepted":
        return "✅"
      case "user_role_changed":
        return "🔄"
      case "system_backup":
        return "💾"
      default:
        return "📌"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
