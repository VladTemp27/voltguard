import { Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TopNav() {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-card border-b border-border px-8 flex items-center justify-between">
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        <Button variant="ghost" size="icon">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
