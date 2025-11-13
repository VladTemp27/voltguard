import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

// iPhone-style notification banner component (styled like dashboard cards)
function NotificationBanner({ notification, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const levelColors = {
    error: { 
      bg: "bg-white/40",
      border: "border-destructive/50",
      text: "text-destructive",
      iconBg: "bg-destructive/10"
    },
    warning: { 
      bg: "bg-white/40",
      border: "border-yellow-500/50",
      text: "text-yellow-600",
      iconBg: "bg-yellow-500/10"
    },
    info: { 
      bg: "bg-white/40",
      border: "border-blue-500/50",
      text: "text-blue-500",
      iconBg: "bg-blue-500/10"
    },
  };

  const colors = levelColors[notification.level] || levelColors.info;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] ${colors.bg} backdrop-blur-md rounded-2xl shadow-2xl border-2 ${colors.border} px-6 py-4 min-w-[320px] max-w-md animate-slide-down cursor-pointer hover:shadow-xl transition-all`}
      onClick={onClose}
      style={{
        animation: "slideDown 0.3s ease-out",
      }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${colors.iconBg} p-2 rounded-lg`}>
          <svg className={`w-6 h-6 ${colors.text}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${colors.text}`}>VoltGuard Alert</p>
          <p className="text-sm mt-1 line-clamp-2 text-gray-700">{notification.message}</p>
          {notification.device && (
            <p className="text-xs mt-1 text-gray-600">Device: {notification.device}</p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="flex-shrink-0 hover:opacity-70 transition-opacity text-gray-500"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function NotificationListener({ onNewNotification }) {
  const [notifications, setNotifications] = useState([]);
  const [bannerNotification, setBannerNotification] = useState(null);
  const socketRef = useRef();
  const receivedNotificationIds = useRef(new Set()); // Track received notification IDs

  useEffect(() => {
    socketRef.current = io("http://localhost:8000", {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to notification service");
    });

    socketRef.current.on("notification", (notification) => {
      // Prevent duplicate notifications
      if (receivedNotificationIds.current.has(notification.id)) {
        console.log("Duplicate notification ignored:", notification.id);
        return;
      }

      console.log("New notification:", notification);
      receivedNotificationIds.current.add(notification.id);
      
      // Add to notifications list
      setNotifications((prev) => [notification, ...prev]);
      
      // Show iPhone-style banner
      setBannerNotification(notification);
      
      // Trigger parent callback if provided
      if (onNewNotification) {
        onNewNotification(notification);
      }
      
      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification("VoltGuard Alert", {
          body: notification.message,
          icon: "/favicon.ico",
        });
      }
    });

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependencies to prevent reconnection loop

  return (
    <>
      {/* iPhone-style notification banner */}
      {bannerNotification && (
        <NotificationBanner
          notification={bannerNotification}
          onClose={() => setBannerNotification(null)}
        />
      )}
      
      {/* Global CSS for animation */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
