import { SidebarNav } from "@/components/sidebar-nav"
import { TopNav } from "@/components/top-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Star, Award, Zap, TrendingUp, Lightbulb } from "lucide-react"
import { useState } from "react"

export default function Game() {
  const [petHealth, setPetHealth] = useState(75)
  const petHappiness = Math.min(100, petHealth + 10)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SidebarNav />
      <TopNav />

      <main className="ml-64 mt-16 p-8 flex-1">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Energy Guardian</h1>
            <p className="text-muted-foreground">Keep your virtual pet healthy by saving energy</p>
          </div>

          {/* Pet Display */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 mb-8">
            <CardContent className="pt-12 pb-12">
              <div className="flex flex-col items-center gap-8">
                {/* Pet Avatar */}
                <div className="relative">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
                    <div className="text-6xl">⚡</div>
                  </div>
                  <div className="absolute bottom-0 right-0 bg-accent rounded-full p-3 shadow-lg">
                    <Heart className="w-6 h-6 text-white" fill="white" />
                  </div>
                </div>

                {/* Pet Name */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-card-foreground mb-2">Spark</h2>
                  <p className="text-muted-foreground">Your Energy Guardian</p>
                </div>

                {/* Health & Happiness Bars */}
                <div className="w-full max-w-md space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-card-foreground">Health</span>
                      <span className="text-sm text-muted-foreground">{petHealth}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-destructive to-destructive/50 h-full transition-all duration-500"
                        style={{ width: `${petHealth}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-card-foreground">Happiness</span>
                      <span className="text-sm text-muted-foreground">{petHappiness}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-accent to-primary h-full transition-all duration-500"
                        style={{ width: `${petHappiness}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-4">
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setPetHealth(Math.min(100, petHealth + 5))}
                  >
                    Feed Pet
                  </Button>
                  <Button variant="outline" className="border-accent text-accent hover:bg-accent/10 bg-transparent">
                    Pet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Current Streak</p>
                    <p className="text-3xl font-bold text-card-foreground">12 days</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total Points</p>
                    <p className="text-3xl font-bold text-card-foreground">2,450</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <Zap className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Level</p>
                    <p className="text-3xl font-bold text-card-foreground">8</p>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <Star className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Zap, title: "Energy Saver", desc: "Save 10 kWh", unlocked: true },
                { icon: Star, title: "Week Warrior", desc: "7-day streak", unlocked: true },
                { icon: Award, title: "Champion", desc: "Reach Level 10", unlocked: false },
                { icon: Heart, title: "Pet Master", desc: "100% pet health", unlocked: false },
                { icon: Lightbulb, title: "Smart Home", desc: "Optimize 5 devices", unlocked: true },
                { icon: TrendingUp, title: "Rising Star", desc: "Level 5 reached", unlocked: true },
              ].map((achievement, idx) => {
                const Icon = achievement.icon
                return (
                  <Card
                    key={idx}
                    className={`border transition-all ${
                      achievement.unlocked
                        ? "bg-card border-accent/30 shadow-md"
                        : "bg-muted/30 border-border opacity-50"
                    }`}
                  >
                    <CardContent className="pt-6 text-center">
                      <div
                        className={`flex justify-center mb-3 ${achievement.unlocked ? "text-accent" : "text-muted-foreground"}`}
                      >
                        <Icon className="w-8 h-8" />
                      </div>
                      <p className="font-semibold text-sm text-card-foreground mb-1">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                      {achievement.unlocked && <div className="mt-2 text-xs text-accent font-semibold">Unlocked</div>}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Weekly Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rank: 1, name: "You", points: "2,450", badge: "crown" },
                  { rank: 2, name: "Alex Chen", points: "2,320", badge: null },
                  { rank: 3, name: "Jordan Lee", points: "2,180", badge: null },
                  { rank: 4, name: "Sam Pro", points: "1,950", badge: null },
                  { rank: 5, name: "Casey Energy", points: "1,780", badge: null },
                ].map((entry) => (
                  <div key={entry.rank} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                      {entry.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-card-foreground">{entry.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-card-foreground">{entry.points}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
