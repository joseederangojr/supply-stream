import Link from "next/link"
import { Bell, User } from "lucide-react"

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">SupplyStream</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/requests" className="text-sm font-medium">
              Requests
            </Link>
            <Link href="/suppliers" className="text-sm font-medium">
              Suppliers
            </Link>
            <Link href="/team" className="text-sm font-medium">
              Team
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2 hover:bg-gray-100">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
