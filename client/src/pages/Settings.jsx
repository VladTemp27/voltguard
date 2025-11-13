import { SidebarNav } from "@/components/sidebar-nav"
import { TopNav } from "@/components/top-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Lock, Eye, Smartphone, Save } from "lucide-react"
import { useState } from "react"

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: true,
    soundEnabled: true,
    privacyMode: false,
    pushNotifications: true,
    dailyReport: true,
    peakHourAlerts: true,
  })

  const [notificationThreshold, setNotificationThreshold] = useState(2.5)
  const [dailyBudget, setDailyBudget] = useState(5.0)

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SidebarNav />
      <TopNav />

      <main className="ml-64 mt-16 p-8 flex-1">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your preferences and system configuration</p>
          </div>

          {/* Account Settings */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-card-foreground block mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue="user@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-card-foreground block mb-2">Username</label>
                <input
                  type="text"
                  defaultValue="EnergyGuardian_2024"
                  className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-card-foreground block mb-2">Password</label>
                <Button variant="outline" className="border-border text-primary hover:bg-primary/10 bg-transparent">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-card-foreground">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Get alerts on your device</p>
                </div>
                <button
                  onClick={() => toggleSetting("pushNotifications")}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.pushNotifications ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.pushNotifications ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-card-foreground">Email Alerts</p>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
                <button
                  onClick={() => toggleSetting("emailAlerts")}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.emailAlerts ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.emailAlerts ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-card-foreground">Peak Hour Alerts</p>
                  <p className="text-sm text-muted-foreground">Alert during high usage times</p>
                </div>
                <button
                  onClick={() => toggleSetting("peakHourAlerts")}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.peakHourAlerts ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.peakHourAlerts ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <label className="text-sm font-semibold text-card-foreground block mb-3">Alert Threshold (kW)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={notificationThreshold}
                    onChange={(e) => setNotificationThreshold(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-muted rounded-lg accent-primary"
                  />
                  <span className="text-sm font-semibold text-card-foreground min-w-fit">
                    {notificationThreshold.toFixed(1)} kW
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-secondary" />
                Display
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-card-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
                <button
                  onClick={() => toggleSetting("darkMode")}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.darkMode ? "bg-primary" : "bg-muted"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.darkMode ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-card-foreground">Sound Effects</p>
                  <p className="text-sm text-muted-foreground">Play notification sounds</p>
                </div>
                <button
                  onClick={() => toggleSetting("soundEnabled")}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.soundEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.soundEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Energy Settings */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Energy Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <label className="text-sm font-semibold text-card-foreground block mb-3">
                  Daily Usage Budget (kWh)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-muted rounded-lg accent-accent"
                  />
                  <span className="text-sm font-semibold text-card-foreground min-w-fit">
                    {dailyBudget.toFixed(1)} kWh
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <Lock className="w-5 h-5 text-destructive" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-card-foreground">Privacy Mode</p>
                  <p className="text-sm text-muted-foreground">Hide data from leaderboard</p>
                </div>
                <button
                  onClick={() => toggleSetting("privacyMode")}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.privacyMode ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.privacyMode ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <Button
                variant="outline"
                className="w-full border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
            <Button variant="outline" className="border-border text-foreground hover:bg-muted bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
