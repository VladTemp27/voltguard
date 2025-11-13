import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { io } from "socket.io-client"

export function CameraSystemModal({ onClose }) {
  const [selectedCamera, setSelectedCamera] = useState("camera-1")
  const imgRef = useRef()
  const socketRef = useRef()
  const [isConnected, setIsConnected] = useState(false)
  const [hasFrame, setHasFrame] = useState(false)

  const cameras = [
    { id: "camera-1", name: "Living Room", status: "active", resolution: "1080p" },
    { id: "camera-2", name: "Kitchen", status: "active", resolution: "720p" },
    { id: "camera-3", name: "Entrance", status: "offline", resolution: "1080p" },
    { id: "camera-4", name: "Garage", status: "active", resolution: "720p" },
  ]

  useEffect(() => {
    socketRef.current = io("http://localhost:8000", {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
    })

    socketRef.current.on("connect", () => {
      console.log("Connected to server")
      setIsConnected(true)
      requestFrame()
    })

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from server")
      setIsConnected(false)
    })

    socketRef.current.on("frame", (data) => {
      if (imgRef.current) {
        imgRef.current.src = `data:image/jpeg;base64,${data.image}`
        setHasFrame(true)
      }
      requestFrame()
    })

    socketRef.current.on("error", (error) => {
      console.error("Frame error:", error)
      setTimeout(requestFrame, 1000)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const requestFrame = () => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("get_frame", {})
    }
  }

  const topAppliance = {
    name: "Air Conditioner",
    hoursOn: 8.5,
    wattage: 4500,
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <Card className="w-full max-w-sm bg-card/95 backdrop-blur-md rounded-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-card/95 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-foreground">System (Camera)</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
          {/* Live Feed Section */}
          <div>
            <div className="flex gap-2 mb-3 flex-wrap">
              <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                {isConnected ? "● Connected" : "○ Disconnected"}
              </Badge>
            </div>
            <div className="bg-gray-900 rounded-2xl aspect-video relative overflow-hidden">
              {!hasFrame && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
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
                    <p className="text-sm text-gray-400">
                      {isConnected ? "Loading feed..." : "Connecting to live feed..."}
                    </p>
                  </div>
                </div>
              )}
              <img
                ref={imgRef}
                alt="Live Video Feed"
                className={`w-full h-full object-contain ${hasFrame ? 'block' : 'hidden'}`}
              />
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
