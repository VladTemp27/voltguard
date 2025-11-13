"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap, BarChart3, Camera, Gamepad2, Settings, AlertCircle } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: AlertCircle },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/system", label: "System", icon: Camera },
  { href: "/game", label: "Game", icon: Gamepad2 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-8 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sidebar-primary">
          <Zap className="w-6 h-6 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-sidebar-foreground">EnergyWatch</h1>
          <p className="text-xs text-sidebar-foreground/70">Monitor & Save</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
