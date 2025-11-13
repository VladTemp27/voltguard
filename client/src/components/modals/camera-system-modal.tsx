"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CameraSystemModalProps {
  onClose: () => void
}

interface Camera {
  id: string
  name: string
  status: "active" | "offline"
  resolution: string
}

interface DetectedDevice {
  id: string
  name: string
  type: string
  confidence: number
}

interface Appliance {
  name: string
  hoursOn: number
  wattage: number
}

export function CameraSystemModal({ onClose }: CameraSystemModalProps) {
  const [selectedCamera, setSelectedCamera] = useState<string>("camera-1")

  const cameras: Camera[] = [
    { id: "camera-1", name: "Living Room", status: "active", resolution: "1080p" },
    { id: "camera-2", name: "Kitchen", status: "active", resolution: "720p" },
    { id: "camera-3", name: "Entrance", status: "offline", resolution: "1080p" },
    { id: "camera-4", name: "Garage", status: "active", resolution: "720p" },
  ]

  const detectedDevices: DetectedDevice[] = [
    { id: "dev-1", name: "Smart Light", type: "Lighting", confidence: 95 },
    { id: "dev-2", name: "AC Unit", type: "HVAC", confidence: 88 },
    { id: "dev-3", name: "Refrigerator", type: "Appliance", confidence: 92 },
  ]

  const topAppliance: Appliance = {
    name: "Air Conditioner",
    hoursOn: 8.5,
    wattage: 3500,
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-sm bg-card rounded-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">System (Camera)</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Live Feed Section */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Live Feed</p>
            <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">Live Feed</p>
              </div>
            </div>
          </div>

          {/* Detected Devices Badges */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Detected Devices</p>
            <div className="flex flex-wrap gap-3">
              {detectedDevices.map((device) => (
                <Badge key={device.id} className="text-xs bg-primary/10 text-primary border border-primary px-3 py-2">
                  <span className="font-semibold">{device.name}</span>
                  <span className="ml-2 opacity-75">({device.confidence}%)</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Top Appliance by Usage */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Top Appliance by Usage</p>
            <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/30 rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground">{topAppliance.name}</p>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Hours On</p>
                  <p className="text-lg font-bold text-secondary">{topAppliance.hoursOn}h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Wattage</p>
                  <p className="text-lg font-bold text-secondary">{topAppliance.wattage}W</p>
                </div>
              </div>
            </div>
          </div>

          {/* Available Cameras */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Available Cameras</p>
            <div className="space-y-2">
              {cameras.map((camera) => (
                <button
                  key={camera.id}
                  onClick={() => setSelectedCamera(camera.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all ${
                    selectedCamera === camera.id
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-gray-50 border border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${camera.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <span className="font-medium text-foreground">{camera.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{camera.resolution}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
