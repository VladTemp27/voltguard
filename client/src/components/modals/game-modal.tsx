"use client"

import { X, Heart, Zap } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface GameModalProps {
  onClose: () => void
}

export function GameModal({ onClose }: GameModalProps) {
  const [happiness, setHappiness] = useState(75)
  const [energy, setEnergy] = useState(60)

  const achievements = [
    { name: "First Steps", unlocked: true },
    { name: "Weekend Warrior", unlocked: true },
    { name: "Green Champion", unlocked: false },
    { name: "Master Saver", unlocked: false },
  ]

  const handleFeedPet = () => {
    setHappiness(Math.min(100, happiness + 15))
    setEnergy(Math.min(100, energy + 10))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-sm bg-card rounded-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Energy Pet - Spark</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Pet Display */}
          <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/30 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">⚡</div>
            <p className="text-lg font-bold text-foreground">Spark</p>
            <p className="text-sm text-muted-foreground">Your energy-saving companion</p>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4 text-destructive" />
                  Happiness
                </span>
                <span className="text-sm font-semibold text-foreground">{happiness}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div className="bg-destructive h-full rounded-full transition-all" style={{ width: `${happiness}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Energy Level
                </span>
                <span className="text-sm font-semibold text-foreground">{energy}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${energy}%` }} />
              </div>
            </div>
          </div>

          {/* Feed Button */}
          <Button
            onClick={handleFeedPet}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-3 rounded-xl"
          >
            Feed Spark
          </Button>

          {/* Progress to Next Milestone */}
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Next Milestone</p>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Master Saver</span>
              <span className="text-sm font-semibold text-foreground">75%</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div className="bg-accent h-full rounded-full transition-all" style={{ width: "75%" }} />
            </div>
          </div>

          {/* Achievements */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Achievements</p>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className={`p-3 rounded-xl text-center border-2 ${
                    achievement.unlocked ? "bg-primary/10 border-primary" : "bg-muted border-border"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold ${achievement.unlocked ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {achievement.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
