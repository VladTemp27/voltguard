import { SidebarNav } from "@/components/sidebar-nav"
import { TopNav } from "@/components/top-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const monthlyData = [
  { month: "Jan", usage: 58, target: 60 },
  { month: "Feb", usage: 62, target: 60 },
  { month: "Mar", usage: 55, target: 60 },
  { month: "Apr", usage: 52, target: 60 },
  { month: "May", usage: 48, target: 60 },
  { month: "Jun", usage: 45, target: 60 },
  { month: "Jul", usage: 51, target: 60 },
]

const hourlyData = [
  { hour: "00:00", usage: 0.8 },
  { hour: "04:00", usage: 0.6 },
  { hour: "08:00", usage: 1.2 },
  { hour: "12:00", usage: 2.1 },
  { hour: "16:00", usage: 2.8 },
  { hour: "20:00", usage: 3.2 },
  { hour: "23:00", usage: 1.5 },
]

const deviceData = [
  { device: "HVAC", usage: 35 },
  { device: "Water Heater", usage: 28 },
  { device: "Kitchen", usage: 18 },
  { device: "Lighting", usage: 12 },
  { device: "Other", usage: 7 },
]

export default function Analytics() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SidebarNav />
      <TopNav />

      <main className="ml-64 mt-16 p-8 flex-1">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">Detailed consumption trends and insights</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-2">Monthly Usage</div>
                <div className="text-2xl font-bold text-card-foreground">51 kWh</div>
                <div className="text-xs text-accent mt-2">-12% vs last month</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-2">Avg Daily Usage</div>
                <div className="text-2xl font-bold text-card-foreground">1.65 kWh</div>
                <div className="text-xs text-accent mt-2">On track</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-2">Peak Hours</div>
                <div className="text-2xl font-bold text-card-foreground">18:00-22:00</div>
                <div className="text-xs text-muted-foreground mt-2">avg 3.2 kW</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-2">Est. Savings</div>
                <div className="text-2xl font-bold text-card-foreground">$24.50</div>
                <div className="text-xs text-accent mt-2">This month</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Monthly Consumption Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-card-foreground">Monthly Consumption</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "4px",
                      }}
                      labelStyle={{ color: "hsl(var(--card-foreground))" }}
                    />
                    <Legend />
                    <Bar dataKey="usage" fill="hsl(var(--chart-1))" name="Usage (kWh)" />
                    <Bar dataKey="target" fill="hsl(var(--chart-2))" name="Target (kWh)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hourly Pattern Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-card-foreground">Hourly Pattern (Today)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "4px",
                      }}
                      labelStyle={{ color: "hsl(var(--card-foreground))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="usage"
                      stroke="hsl(var(--primary))"
                      name="Usage (kW)"
                      dot={{ fill: "hsl(var(--primary))" }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Device Breakdown */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Usage by Device</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={deviceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="device" type="category" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "4px",
                    }}
                    labelStyle={{ color: "hsl(var(--card-foreground))" }}
                  />
                  <Bar dataKey="usage" fill="hsl(var(--accent))" name="Usage (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Behavioral Insights */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Behavioral Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg border border-border">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-card-foreground">Peak consumption identified</p>
                    <p className="text-sm text-muted-foreground">Between 6 PM and 10 PM on weekdays</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg border border-border">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-card-foreground">Optimization opportunity</p>
                    <p className="text-sm text-muted-foreground">Reduce HVAC usage during peak hours could save 15%</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg border border-border">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-card-foreground">Weekend efficiency</p>
                    <p className="text-sm text-muted-foreground">
                      Your usage drops 18% on weekends - maintain these habits
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
