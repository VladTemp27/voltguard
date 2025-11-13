import { SidebarNav } from "@/components/sidebar-nav"
import { TopNav } from "@/components/top-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Circle, Settings, Power, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useState } from "react"

const cameras = [
  {
    id: "1",
    name: "Camera 1",
    location: "Living Room",
    status: "active",
    resolution: "1080p",
    fps: 30,
    lastSeen: "Now",
  },
  {
    id: "2",
    name: "Camera 2",
    location: "Kitchen",
    status: "active",
    resolution: "1080p",
    fps: 30,
    lastSeen: "Now",
  },
  {
    id: "3",
    name: "Camera 3",
    location: "Bedroom",
    status: "active",
    resolution: "720p",
    fps: 15,
    lastSeen: "2 min ago",
  },
  {
    id: "4",
    name: "Camera 4",
    location: "Garage",
    status: "inactive",
    resolution: "1080p",
    fps: 30,
    lastSeen: "1 hour ago",
  },
  {
    id: "5",
    name: "Camera 5",
    location: "Basement",
    status: "maintenance",
    resolution: "720p",
    fps: 15,
    lastSeen: "3 days ago",
  },
]

function getStatusColor(status) {
  switch (status) {
    case "active":
      return "bg-accent text-accent-foreground"
    case "inactive":
      return "bg-muted text-muted-foreground"
    case "maintenance":
      return "bg-destructive/10 text-destructive"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "active":
      return <CheckCircle2 className="w-5 h-5" />
    case "inactive":
      return <Circle className="w-5 h-5" />
    case "maintenance":
      return <AlertTriangle className="w-5 h-5" />
    default:
      return <Circle className="w-5 h-5" />
  }
}

export default function System() {
  const [selectedCamera, setSelectedCamera] = useState(null)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SidebarNav />
      <TopNav />

      <main className="ml-64 mt-16 p-8 flex-1">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">System</h1>
              <p className="text-muted-foreground">Manage cameras and monitoring devices</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Add Camera</Button>
          </div>

          {/* System Status Overview */}
          <Card className="bg-card border-border mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Total Cameras</div>
                  <div className="text-3xl font-bold text-card-foreground">5</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Active</div>
                  <div className="text-3xl font-bold text-accent">3</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Inactive</div>
                  <div className="text-3xl font-bold text-muted-foreground">1</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Maintenance</div>
                  <div className="text-3xl font-bold text-destructive">1</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Feed Grid */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Live Feed Preview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cameras.map((camera) => (
                <div
                  key={camera.id}
                  onClick={() => setSelectedCamera(camera.id)}
                  className={`cursor-pointer transition-all rounded-lg border-2 overflow-hidden ${
                    selectedCamera === camera.id ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="bg-gradient-to-br from-muted to-muted-foreground/20 aspect-video flex items-center justify-center relative">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        {getStatusIcon(camera.status)}
                      </div>
                      <span className="text-sm text-muted-foreground">{camera.name}</span>
                    </div>
                    <div
                      className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(camera.status)}`}
                    >
                      <Circle className="w-2 h-2 fill-current" />
                      {camera.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Camera Status Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Camera Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Camera</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Location</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Resolution</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">FPS</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Last Seen</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cameras.map((camera, idx) => (
                      <tr
                        key={camera.id}
                        className={`border-b border-border ${
                          idx !== cameras.length - 1 ? "" : ""
                        } hover:bg-muted/50 transition-colors`}
                      >
                        <td className="py-3 px-4 text-card-foreground font-medium">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(camera.status)}
                            {camera.name}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{camera.location}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(camera.status)}`}
                          >
                            <Circle className="w-2 h-2 fill-current" />
                            {camera.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{camera.resolution}</td>
                        <td className="py-3 px-4 text-muted-foreground">{camera.fps}</td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{camera.lastSeen}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                              <Power className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
