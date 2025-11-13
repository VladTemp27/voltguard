"use client"

import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface AlertsModalProps {
  onClose: () => void
}

export function AlertsModal({ onClose }: AlertsModalProps) {
  const alerts = [
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
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-sm bg-card rounded-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Alert Log</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-3">
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
