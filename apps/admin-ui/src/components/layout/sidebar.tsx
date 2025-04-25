import Link from "next/link"
import {
  BarChart,
  Users,
  Building,
  Settings,
  HelpCircle,
  Shield,
  Database,
  Bell,
  CreditCard,
  FileText,
} from "lucide-react"

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-white">
      <div className="flex flex-col gap-1 p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
        >
          <BarChart className="h-5 w-5" />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>
        <Link
          href="/organizations"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
        >
          <Building className="h-5 w-5" />
          <span className="text-sm font-medium">Organizations</span>
        </Link>
        <Link
          href="/users"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
        >
          <Users className="h-5 w-5" />
          <span className="text-sm font-medium">Users</span>
        </Link>
        <Link
          href="/requests"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
        >
          <FileText className="h-5 w-5" />
          <span className="text-sm font-medium">Requests</span>
        </Link>
        <Link
          href="/billing"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
        >
          <CreditCard className="h-5 w-5" />
          <span className="text-sm font-medium">Billing</span>
        </Link>

        <div className="mt-6 border-t pt-4">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">System</h3>
          <div className="mt-2 space-y-1">
            <Link
              href="/system/security"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
            >
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Security</span>
            </Link>
            <Link
              href="/system/database"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
            >
              <Database className="h-5 w-5" />
              <span className="text-sm font-medium">Database</span>
            </Link>
            <Link
              href="/system/notifications"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
            >
              <Bell className="h-5 w-5" />
              <span className="text-sm font-medium">Notifications</span>
            </Link>
            <Link
              href="/system/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <Link
            href="/help"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Help & Support</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
