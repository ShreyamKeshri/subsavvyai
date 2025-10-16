"use client"

import { Bell, Search, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 md:px-8 py-4">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted text-foreground placeholder-muted-foreground border border-input focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 ml-6">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
