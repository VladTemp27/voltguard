import { useState } from "react"
import { DashboardContent } from "@/components/dashboard-content"
import { Chatbot } from "@/components/chatbot"
import { StreaksModal } from "@/components/modals/streaks-modal"
import { AlertsModal } from "@/components/modals/alerts-modal"
import { AnalyticsModal } from "@/components/modals/analytics-modal"
import { GameModal } from "@/components/modals/game-modal"
import { CameraSystemModal } from "@/components/modals/camera-system-modal"
import NotificationListener from "@/components/NotificationListener"

export default function Dashboard() {
  const [activeModal, setActiveModal] = useState(null)
  const [notifications, setNotifications] = useState([])

  const streakData = [
    { label: "Current Streak", value: "12", unit: "days" },
    { label: "Best Streak", value: "28", unit: "days" },
    { label: "This Week", value: "6/7", unit: "goals met" },
  ]

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev])
  }

  return (
    <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-4">
      {/* Notification Listener with iPhone-style banners */}
      <NotificationListener onNewNotification={handleNewNotification} />

      {/* Mobile Phone Container */}
      <div className="w-full max-w-sm relative">
        {/* Phone Frame */}
        <DashboardContent 
          setActiveModal={setActiveModal} 
          activeModal={activeModal}
          notifications={notifications}
        />

        {/* Chatbot */}
        <Chatbot />
      </div>

      {/* Modals */}
      {activeModal === "streaks" && <StreaksModal onClose={() => setActiveModal(null)} />}
      {activeModal === "camera" && <CameraSystemModal onClose={() => setActiveModal(null)} />}
      {activeModal === "alerts" && <AlertsModal onClose={() => setActiveModal(null)} notifications={notifications} />}
      {activeModal === "analytics" && <AnalyticsModal onClose={() => setActiveModal(null)} />}
      {activeModal === "game" && <GameModal onClose={() => setActiveModal(null)} />}
    </div>
  )
}
