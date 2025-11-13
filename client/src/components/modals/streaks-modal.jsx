import { X, TrendingUp, Zap, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"

// Tier configuration based on requirements
const TIER_CONFIG = {
  'Starter': {
    color: '#FFFFFF',
    bgColor: '#F5F5F5',
    image: '/images/energy-pet-starter.png',
    description: 'Base form - small and inactive',
    animation: 'idle',
    minStreak: 0,
    maxStreak: 3
  },
  'Low Activity': {
    color: '#FE8D00',
    bgColor: '#FFF3E0',
    image: '/images/energy-pet-bad.png',
    description: 'Dull and sleepy - showing neglect',
    animation: 'sleeping',
    minStreak: 0,
    maxStreak: 3
  },
  'Steady': {
    color: '#FFC94A',
    bgColor: '#FFF9E6',
    image: '/images/energy-pet-medium.png',
    description: 'Lively and growing - balanced progress',
    animation: 'happy',
    minStreak: 4,
    maxStreak: 10
  },
  'High Performer': {
    color: '#245C94',
    bgColor: '#E3F2FD',
    image: '/images/energy-pet-good.png',
    description: 'Fully evolved and glowing - optimal behavior',
    animation: 'glowing',
    minStreak: 11,
    maxStreak: 999
  }
}

// Calculate tier based on streak and efficiency
function calculateTier(streakDays, avgEfficiency, missedDays) {
  // Drop to Low Activity if missed more than 2 days OR efficiency below 40%
  if (missedDays > 2 || avgEfficiency < 40) {
    return 'Low Activity'
  }
  
  // High Performer: 11+ days with 60%+ efficiency
  if (streakDays >= 11 && avgEfficiency >= 60) {
    return 'High Performer'
  }
  
  // Steady: 4-10 days with 50%+ efficiency
  if (streakDays >= 4 && streakDays <= 10 && avgEfficiency >= 50) {
    return 'Steady'
  }
  
  // Default to Starter
  return 'Starter'
}

export function StreaksModal({ onClose }) {
  // State for streak data (will be fetched from database)
  const [streakData, setStreakData] = useState({
    currentStreak: 5,
    bestStreak: 12,
    missedDays: 0,
    avgEfficiency: 65,
    weeklyGoalsMet: 6,
    totalGoals: 7
  })

  // State for weekly usage data (from DailyUsage table)
  const [weeklyUsage, setWeeklyUsage] = useState([
    { day: 'Monday', usage: 80 },
    { day: 'Tuesday', usage: 90 },
    { day: 'Wednesday', usage: 120 },
    { day: 'Thursday', usage: 75 },
    { day: 'Friday', usage: 60 },
    { day: 'Saturday', usage: 110 },
    { day: 'Sunday', usage: 95 }
  ])

  // Calculate current tier
  const currentTier = calculateTier(
    streakData.currentStreak,
    streakData.avgEfficiency,
    streakData.missedDays
  )
  const petStatus = TIER_CONFIG[currentTier]

  // TODO: Fetch data from PostgreSQL database
  useEffect(() => {
    // This will be replaced with actual API call to backend
    // Example: fetchStreakData(userId).then(data => setStreakData(data))
    // Example: fetchWeeklyUsage(userId).then(data => setWeeklyUsage(data))
  }, [])

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

        <div className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-hide">
          {/* Current Streak with Tier Badge */}
          <div 
            className="rounded-2xl p-4 border-2 transition-all duration-300"
            style={{ 
              background: `linear-gradient(135deg, ${petStatus.bgColor} 0%, ${petStatus.color}15 100%)`,
              borderColor: petStatus.color
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Current Streak
              </p>
              <div 
                className="px-3 py-1 rounded-full text-xs font-bold border-2"
                style={{ 
                  backgroundColor: petStatus.bgColor,
                  color: petStatus.color === '#FFFFFF' ? '#666' : petStatus.color,
                  borderColor: petStatus.color
                }}
              >
                {currentTier}
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">{streakData.currentStreak} Days</p>
            <div className="flex items-center gap-2 mt-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {streakData.weeklyGoalsMet}/{streakData.totalGoals} goals met this week
              </p>
            </div>
          </div>

          {/* Tier Progress Bar */}
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground">Progress to Next Tier</p>
              <Award className="w-4 h-4 text-primary" />
            </div>
            
            {currentTier !== 'High Performer' ? (
              <>
                <div className="w-full bg-border rounded-full h-2 mb-2">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((streakData.currentStreak / (petStatus.maxStreak + 1)) * 100, 100)}%`,
                      backgroundColor: petStatus.color
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentTier === 'Starter' && 'Keep going for 4 days to reach Steady!'}
                  {currentTier === 'Low Activity' && 'Improve your activity to advance!'}
                  {currentTier === 'Steady' && `${11 - streakData.currentStreak} more days to High Performer!`}
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-primary">
                <Award className="w-5 h-5" />
                <p className="text-sm font-semibold">Maximum Tier Achieved! 🎉</p>
              </div>
            )}
          </div>

          {/* Best Streak */}
          <div className="bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Best Streak</p>
            <p className="text-2xl font-bold text-foreground mt-1">{streakData.bestStreak} Days</p>
          </div>

          {/* Daily Usage Graph */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Daily Usage</p>
            <div className="flex items-end gap-1 h-20">
              {weeklyUsage.map((data, i) => (
                <div
                  key={data.day}
                  className="flex-1 rounded-sm opacity-70 hover:opacity-100 transition-all duration-500 animate-in slide-in-from-bottom relative group"
                  style={{ 
                    height: `${(data.usage / 240) * 100}%`,
                    background: `linear-gradient(to top, ${petStatus.color}, ${petStatus.color}80)`,
                    animationDelay: `${i * 100}ms`,
                    animationFillMode: 'backwards'
                  }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {data.usage} min
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              {weeklyUsage.map(data => (
                <span key={data.day}>{data.day.slice(0, 3)}</span>
              ))}
            </div>
          </div>

          {/* Energy Pet Display */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Your Energy Pet</p>
            <div 
              className="relative rounded-2xl overflow-hidden backdrop-blur-md border-2 shadow-lg transition-all duration-500"
              style={{ 
                backgroundColor: petStatus.bgColor,
                borderColor: petStatus.color
              }}
            >
              {/* Animated background */}
              <div className="p-8 flex flex-col items-center justify-center min-h-[280px] relative">
                {/* Radial gradient behind pet */}
                <div 
                  className="absolute inset-0 opacity-40 transition-opacity duration-1000"
                  style={{
                    background: `radial-gradient(circle at center, ${petStatus.color} 0%, transparent 70%)`,
                    animation: petStatus.animation === 'glowing' ? 'pulse 2s ease-in-out infinite' : 'none'
                  }}
                />
                
                {/* Pet Image with animation class */}
                <div className={`w-48 h-48 relative mb-4 z-10 transition-transform duration-500 ${
                  petStatus.animation === 'glowing' ? 'animate-bounce' : 
                  petStatus.animation === 'happy' ? 'hover:scale-110' :
                  petStatus.animation === 'sleeping' ? 'opacity-60' : ''
                }`}>
                  <img
                    src={petStatus.image}
                    alt="Energy Pet"
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                  
                  {/* Glowing effect for High Performer */}
                  {petStatus.animation === 'glowing' && (
                    <div 
                      className="absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse"
                      style={{ backgroundColor: petStatus.color }}
                    />
                  )}
                </div>

                {/* Pet Level Label */}
                <div 
                  className="backdrop-blur-sm rounded-full px-6 py-2 border-2 shadow-lg z-10 transition-all duration-300"
                  style={{ 
                    backgroundColor: `${petStatus.bgColor}CC`,
                    borderColor: petStatus.color
                  }}
                >
                  <p 
                    className="text-sm font-bold text-center"
                    style={{ color: petStatus.color === '#FFFFFF' ? '#666' : petStatus.color }}
                  >
                    {currentTier}
                  </p>
                </div>
              </div>
            </div>

            {/* Pet Status Description */}
            <p className="text-xs text-muted-foreground text-center mt-3">
              {petStatus.description}
            </p>
            
            {/* Motivational message based on tier */}
            <div className="mt-3 p-3 bg-muted/20 rounded-lg border border-border">
              <p className="text-xs text-foreground text-center font-medium">
                {currentTier === 'Starter' && '🌱 Start your journey! Use the app daily to help your pet grow.'}
                {currentTier === 'Low Activity' && '⚠️ Your pet needs attention! Return to daily activity to restore energy.'}
                {currentTier === 'Steady' && '✨ Great progress! Keep it up to unlock the final evolution.'}
                {currentTier === 'High Performer' && '🏆 Amazing! You\'re an energy champion. Keep up the excellent work!'}
              </p>
            </div>
          </div>

          {/* Tier System Info */}
          <div className="bg-muted/10 rounded-xl p-4 border border-border">
            <p className="text-xs font-semibold text-foreground mb-3">Tier System</p>
            <div className="space-y-2">
              {Object.entries(TIER_CONFIG).map(([tier, config]) => (
                <div 
                  key={tier}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    tier === currentTier ? 'bg-primary/10 border border-primary/30' : 'opacity-60'
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0 border-2"
                    style={{ 
                      backgroundColor: config.color === '#FFFFFF' ? '#F5F5F5' : config.color,
                      borderColor: config.color
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{tier}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {config.minStreak === 0 && tier === 'Starter' ? 'New users' : 
                       tier === 'Low Activity' ? 'Missed 2+ days' :
                       `${config.minStreak}+ days streak`}
                    </p>
                  </div>
                  {tier === currentTier && <Award className="w-4 h-4 text-primary flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
