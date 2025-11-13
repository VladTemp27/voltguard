import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function AlertsModal({ onClose, notifications = [] }) {
  // Combine live notifications with static alerts
  const liveAlerts = notifications.map((notif, index) => ({
    id: `live_${notif.id || index}`,
    camera: notif.device || "System",
    type: notif.message.split(' ').slice(0, 3).join(' '),
    severity: notif.level === "error" ? "high" : notif.level === "warning" ? "medium" : "low",
    time: new Date(notif.timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }),
    desc: notif.message,
  }));

  const staticAlerts = [
    {
      id: 1,
      camera: "Camera 3",
      type: "High Usage",
      severity: "high",
      time: "2:45 PM",
      desc: "AC running above threshold",
    },
    {
      id: 2,
      camera: "Camera 1",
      type: "Anomaly",
      severity: "medium",
      time: "1:20 PM",
      desc: "Unusual pattern detected",
    },
    {
      id: 3,
      camera: "Camera 2",
      type: "Peak Time",
      severity: "low",
      time: "12:15 PM",
      desc: "Usage during peak hours",
    },
    {
      id: 4,
      camera: "Camera 4",
      type: "High Usage",
      severity: "high",
      time: "11:00 AM",
      desc: "Heater running continuously",
    },
  ];

  // Merge live and static alerts
  const alerts = [...liveAlerts, ...staticAlerts];

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <Card className="w-full max-w-sm bg-card/95 backdrop-blur-md rounded-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Alert Log</h2>
            {notifications.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {notifications.length} new
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-3 overflow-y-auto scrollbar-hide">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border-2 ${
                alert.severity === "high"
                  ? "bg-destructive/10 border-destructive/50"
                  : alert.severity === "medium"
                    ? "bg-yellow-500/10 border-yellow-500/50"
                    : "bg-blue-500/10 border-blue-500/50"
              }`}
            >
              <div className="flex gap-3">
                <AlertCircle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    alert.severity === "high"
                      ? "text-destructive"
                      : alert.severity === "medium"
                        ? "text-yellow-500"
                        : "text-blue-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{alert.type}</p>
                  <p className="text-xs text-muted-foreground">{alert.camera}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.desc}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
