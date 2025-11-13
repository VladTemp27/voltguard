import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardContent({ setActiveModal, activeModal }) {
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
        className="px-6 py-6 space-y-4 overflow-y-auto max-h-[600px]"
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

        {/* Alerts Card */}
        <button onClick={() => setActiveModal("alerts")} className="w-full text-left focus:outline-none">
          <Card className="border border-white/20 hover:shadow-2xl transition-all cursor-pointer bg-white/40 backdrop-blur-md shadow-lg gap-3">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg text-primary">Alert Pings (Logs)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-destructive/10 border-2 border-destructive/50 p-3 rounded-lg">
                <p className="text-base font-semibold text-destructive">High Usage Detected</p>
                <p className="text-base text-gray-600 mt-1">Camera 3 • 2:45 PM</p>
              </div>
              <div className="bg-blue-500/10 border-2 border-blue-500/50 p-3 rounded-lg">
                <p className="text-base font-semibold text-blue-500">Device Offline</p>
                <p className="text-base text-gray-600 mt-1">Camera 5 • 1:30 PM</p>
              </div>
              <div className="text-base text-secondary font-semibold">3 Active Alerts</div>
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
