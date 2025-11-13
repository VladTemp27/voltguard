import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function NotificationListener() {
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io("http://localhost:8000", {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to notification service");
    });

    socketRef.current.on("notification", (notification) => {
      console.log("New notification:", notification);
      setNotifications((prev) => [notification, ...prev]);
      
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
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div style={{ 
      position: "fixed", 
      top: 20, 
      right: 20, 
      width: 320,
      maxHeight: 400,
      overflow: "auto",
      backgroundColor: "white",
      borderRadius: 8,
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      padding: 15,
      zIndex: 1000
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
      }}>
        <h3 style={{ margin: 0 }}>Notifications ({notifications.length})</h3>
        <button 
          onClick={clearNotifications}
          style={{
            padding: "5px 10px",
            fontSize: 12,
            cursor: "pointer"
          }}
        >
          Clear All
        </button>
      </div>
      
      {notifications.length === 0 ? (
        <p style={{ color: "#999", textAlign: "center" }}>No notifications</p>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif.id}
            style={{
              padding: 10,
              marginBottom: 8,
              backgroundColor: notif.level === "warning" ? "#fff3cd" : "#d1ecf1",
              border: `1px solid ${notif.level === "warning" ? "#ffc107" : "#0dcaf0"}`,
              borderRadius: 4,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 4 }}>
              {notif.device ? `Device: ${notif.device}` : "Alert"}
            </div>
            <div style={{ fontSize: 13 }}>{notif.message}</div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
              {new Date(notif.timestamp).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
