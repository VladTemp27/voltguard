import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

function getPetLevel(dailyUsageMinutes) {
  switch (true) {
    case dailyUsageMinutes === 0:
      return { 
        level: "Starter / New", 
        color: "#FFFFFF",
        image: "/images/energy-pet-starter.png"
      }
    case dailyUsageMinutes > 180: // More than 3 hours
      return { 
        level: "Low Activity", 
        color: "#FE8D00",
        image: "/images/energy-pet-bad.png"
      }
    case dailyUsageMinutes > 120: // 2-3 hours
      return { 
        level: "Steady", 
        color: "#FFC94A",
        image: "/images/energy-pet-medium.png"
      }
    default: // Less than 2 hours
      return { 
        level: "High Performer", 
        color: "#245C94",
        image: "/images/energy-pet-good.png"
      }
  }
}

export function StreaksModal({ onClose }) {
  const avgDailyUsage = 90 // Average daily usage in minutes
  const petStatus = getPetLevel(avgDailyUsage)

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <Card className="w-full max-w-sm bg-card/95 backdrop-blur-md rounded-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-foreground">Streak History</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Current Streak */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-2xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Streak</p>
            <p className="text-3xl font-bold text-foreground mt-2">5 Days</p>
            <p className="text-sm text-muted-foreground mt-1">Below-average usage time</p>
          </div>

          {/* Daily Usage Graph */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Daily Usage (Minutes)</p>
            <div className="flex items-end gap-1 h-20">
              {[80, 90, 120, 75, 60, 110, 95].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-sm opacity-70 hover:opacity-100 transition-all duration-500 animate-in slide-in-from-bottom"
                  style={{ 
                    height: `${(height / 240) * 100}%`, // Scale based on max 4 hours (240 min)
                    animationDelay: `${i * 100}ms`,
                    animationFillMode: 'backwards'
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Mon</span>
              <span>Sun</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Your Energy Pet</p>
            <div className="relative rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md border border-white/30 shadow-lg">
              {/* Glass background with radial gradient */}
              <div className="p-8 flex flex-col items-center justify-center min-h-[280px] relative">
                {/* Radial gradient behind pet */}
                <div 
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: `radial-gradient(circle at center, ${petStatus.color} 0%, transparent 70%)`
                  }}
                />
                
                {/* Pet Image */}
                <div className="w-48 h-48 relative mb-4 z-10">
                  <img
                    src={petStatus.image}
                    alt="Energy Pet"
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>

                {/* Pet Level Label */}
                <div className="bg-card/95 backdrop-blur-sm rounded-full px-6 py-2 border border-border shadow-lg z-10">
                  <p className="text-sm font-bold text-foreground text-center">{petStatus.level}</p>
                </div>
              </div>
            </div>

            {/* Usage Description */}
            <p className="text-xs text-muted-foreground text-center mt-3">
              Reduce your daily usage time to improve your pet's health!
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
