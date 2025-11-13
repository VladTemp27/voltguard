import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"

export function DashboardContent({ setActiveModal, activeModal, notifications = [] }) {
  const [alertLogs, setAlertLogs] = useState([
    {
      id: "default_1",
      message: "High Usage Detected",
      device: "Camera 3",
      time: "2:45 PM",
      level: "error"
    },
    {
      id: "default_2",
      message: "Device Offline",
      device: "Camera 5",
      time: "1:30 PM",
      level: "warning"
    }
  ]);

  // Update alert logs when new notifications arrive
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      const newLog = {
        id: latestNotification.id,
        message: latestNotification.message,
        device: latestNotification.device || "System",
        time: new Date(latestNotification.timestamp).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        level: latestNotification.level || "info"
      };
      
      // Only add if not already in logs (prevent duplicates)
      setAlertLogs(prev => {
        const exists = prev.some(log => log.id === newLog.id);
        if (exists) return prev;
        return [newLog, ...prev].slice(0, 10); // Keep only last 10
      });
    }
  }, [notifications]);

  const getLevelColor = (level) => {
    switch (level) {
      case "error":
        return { bg: "bg-destructive/10", border: "border-destructive/50", text: "text-destructive" };
      case "warning":
        return { bg: "bg-yellow-500/10", border: "border-yellow-500/50", text: "text-yellow-600" };
      case "info":
        return { bg: "bg-blue-500/10", border: "border-blue-500/50", text: "text-blue-500" };
      default:
        return { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-600" };
    }
  };

  return (
    <div 
      className={`bg-white rounded-3xl shadow-2xl border-8 border-gray-200 overflow-hidden transition-all duration-300 ${activeModal ? 'blur-sm' : ''}`} 
      style={{ backgroundColor: '#FFF8F0' }}
    >
      {/* Dashboard Header with Logo and Notification */}
      <div className="bg-white/50 backdrop-blur-xl px-6 py-4 flex items-center justify-center border-b border-white/30 shadow-lg">
        <img src="/voltguard-logo.png" alt="VoltGuard" className="h-12 object-contain" />
      </div>

      {/* Main Content */}
      <div 
        className="px-6 py-6 space-y-4 overflow-y-auto max-h-[600px] scrollbar-hide"
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Streaks Card */}
          <button onClick={() => setActiveModal("streaks")} className="w-full text-left focus:outline-none">
            <Card className="border border-white/20 hover:shadow-2xl transition-all cursor-pointer bg-white/40 backdrop-blur-md shadow-lg gap-2 h-full">
              <CardHeader className="pb-0">
                <CardTitle className="text-base text-primary">Streaks</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-16 pb-2">
                <div className="text-center">
                  <p className="text-5xl font-bold text-primary">12</p>
                  <p className="text-base text-gray-600">days</p>
                </div>
              </CardContent>
            </Card>
          </button>

          <button onClick={() => setActiveModal("camera")} className="w-full text-left focus:outline-none">
            <Card className="border border-white/20 hover:shadow-2xl transition-all cursor-pointer bg-white/40 backdrop-blur-md shadow-lg gap-2 h-full">
              <CardHeader className="pb-0">
                <CardTitle className="text-base text-primary">System</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-16 pb-2">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </CardContent>
            </Card>
          </button>
        </div>

        {/* Alerts Card - Now with live notifications */}
        <button onClick={() => setActiveModal("alerts")} className="w-full text-left focus:outline-none">
          <Card className="border border-white/20 hover:shadow-2xl transition-all cursor-pointer bg-white/40 backdrop-blur-md shadow-lg gap-3">
            <CardHeader className="pb-0 flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-primary">Alert Pings (Logs)</CardTitle>
              {notifications.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {notifications.length}
                </span>
              )}
            </CardHeader>
            <CardContent className="space-y-3 max-h-64 overflow-y-auto">
              {alertLogs.slice(0, 3).map((log) => {
                const colors = getLevelColor(log.level);
                return (
                  <div key={log.id} className={`${colors.bg} border-2 ${colors.border} p-3 rounded-lg transition-all`}>
                    <p className={`text-base font-semibold ${colors.text}`}>{log.message}</p>
                    <p className="text-base text-gray-600 mt-1">{log.device} • {log.time}</p>
                  </div>
                );
              })}
              <div className="text-base text-secondary font-semibold">{alertLogs.length} Active Alerts</div>
            </CardContent>
          </Card>
        </button>

        {/* Analytics Card */}
        <button onClick={() => setActiveModal("analytics")} className="w-full text-left focus:outline-none pb-4">
          <Card className="border border-white/20 hover:shadow-2xl transition-all cursor-pointer bg-white/40 backdrop-blur-md h-64 shadow-lg gap-3">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg text-secondary">Analytics</CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-5xl font-bold text-primary">320</p>
                  <p className="text-base text-gray-600 mt-2">kWh This Month</p>
                  <p className="text-base text-secondary font-semibold mt-2">↓ 8% from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </button>
      </div>
    </div>
  )
}
