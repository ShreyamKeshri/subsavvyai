"use client"

import { BarChart3, Settings, LogOut, Home, TrendingDown, Zap, Package, PiggyBank, BookText, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { auth } from "@/lib/auth/auth-helpers"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const result = await auth.signOut()
    if (result.success) {
      toast.success("Signed out successfully")
      router.push("/login")
    } else {
      toast.error("Failed to sign out")
    }
  }

  return (
    <aside className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground">SubSavvyAI</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavItem
          icon={Home}
          label="Dashboard"
          href="/dashboard"
          active={pathname === '/dashboard'}
        />
        <NavItem
          icon={TrendingDown}
          label="Subscriptions"
          href="/dashboard/subscriptions"
          active={pathname === '/dashboard/subscriptions'}
        />
        <NavItem
          icon={PiggyBank}
          label="Savings Tracker"
          href="/dashboard/savings"
          active={pathname === '/dashboard/savings'}
        />
        <NavItem
          icon={Zap}
          label="Recommendations"
          href="/dashboard/recommendations"
          active={pathname === '/dashboard/recommendations'}
        />
        <NavItem
          icon={Package}
          label="Bundles"
          href="/dashboard/bundles"
          active={pathname === '/dashboard/bundles'}
        />
        <NavItem
          icon={BookText}
          label="Guides"
          href="/dashboard/guides"
          active={pathname?.startsWith('/dashboard/guides') === true}
        />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <NavItem
          icon={Settings}
          label="Settings"
          href="/dashboard/settings"
          active={pathname === '/dashboard/settings'}
        />
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

function NavItem({
  icon: Icon,
  label,
  href,
  active = false,
}: {
  icon: LucideIcon
  label: string
  href: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
