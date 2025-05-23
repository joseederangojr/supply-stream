import Link from "next/link"
import { BarChart, FileText, Users, Building, CreditCard, Settings, HelpCircle } from "lucide-react"

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
          href="/requests"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
        >
          <FileText className="h-5 w-5" />
          <span className="text-sm font-medium">Requests</span>
        </Link>
        <Link
          href="/suppliers"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
        >
          <Building className="h-5 w-5" />
          <span className="text-sm font-medium">Suppliers</span>
        </Link>
        <Link
          href="/team"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
        >
          <Users className="h-5 w-5" />
          <span className="text-sm font-medium">Team</span>
        </Link>
        <Link
          href="/payments"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
        >
          <CreditCard className="h-5 w-5" />
          <span className="text-sm font-medium">Payments</span>
        </Link>

        <div className="mt-6 border-t pt-4">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
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
