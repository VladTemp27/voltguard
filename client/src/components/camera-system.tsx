"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

export function CameraSystem() {
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

  return (
    <div className="w-full space-y-4">
      {/* Live Feed Section */}
      <Card className="border-2 border-primary bg-white shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-primary">System (Camera)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Live Feed Placeholder */}
          <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
            <div className="relative z-10 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-400">Live Feed</p>
            </div>
          </div>

          {/* Detected Devices Badges */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Detected Devices</p>
            <div className="flex flex-wrap gap-2">
              {detectedDevices.map((device) => (
                <Badge key={device.id} variant="outline" className="text-xs bg-primary/10 text-primary border-primary">
                  <span>{device.name}</span>
                  <span className="ml-1 text-xs opacity-70">({device.confidence}%)</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Available Cameras */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Available Cameras</p>
            <div className="space-y-2">
              {cameras.map((camera) => (
                <button
                  key={camera.id}
                  onClick={() => setSelectedCamera(camera.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
                    selectedCamera === camera.id
                      ? "bg-primary/10 border border-primary"
                      : "bg-gray-50 border border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${camera.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <span className="font-medium text-gray-700">{camera.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{camera.resolution}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
