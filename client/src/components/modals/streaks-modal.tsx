"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface StreaksModalProps {
  onClose: () => void
}

function getEfficiencyLevel(avgConsumption: number) {
  if (avgConsumption === 0) return { level: "Starter / New", color: "bg-white" }
  if (avgConsumption > 80) return { level: "Low Efficiency", color: "bg-orange-500" }
  if (avgConsumption > 60)
    return { level: "Medium Efficiency", color: "bg-gradient-to-br from-yellow-400 to-amber-500" }
  if (avgConsumption > 40) return { level: "High Efficiency", color: "bg-blue-900" }
  return { level: "Perfect Streak", color: "bg-blue-400" }
}

export function StreaksModal({ onClose }: StreaksModalProps) {
  const avgConsumption = 35 // This represents the average daily consumption percentage
  const efficiency = getEfficiencyLevel(avgConsumption)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-sm bg-card rounded-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Streak History</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Current Streak */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-2xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Streak</p>
            <p className="text-3xl font-bold text-foreground mt-2">5 Days</p>
            <p className="text-sm text-muted-foreground mt-1">Below-average consumption</p>
          </div>

          {/* Daily Usage Graph */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Daily Usage Pattern</p>
            <div className="flex items-end gap-1 h-20">
              {[40, 35, 50, 30, 25, 45, 38].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                  style={{ height: `${height}%` }}
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
            <div className="relative rounded-2xl overflow-hidden border-2 border-border">
              {/* Dynamic background based on efficiency */}
              <div className={`${efficiency.color} p-8 flex flex-col items-center justify-center min-h-[280px]`}>
                {/* Pet Image */}
                <div className="w-48 h-48 relative mb-4">
                  <img
                    src="/images/energy-pet.png"
                    alt="Energy Pet"
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>

                {/* Efficiency Level Label */}
                <div className="bg-card/95 backdrop-blur-sm rounded-full px-6 py-2 border border-border shadow-lg">
                  <p className="text-sm font-bold text-foreground text-center">{efficiency.level}</p>
                </div>
              </div>
            </div>

            {/* Efficiency Description */}
            <p className="text-xs text-muted-foreground text-center mt-3">
              Keep up your energy-saving habits to reach the next level!
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
