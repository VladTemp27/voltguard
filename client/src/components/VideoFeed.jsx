import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function VideoFeed() {
  const imgRef = useRef();
  const socketRef = useRef();
  const [stats, setStats] = useState({ lights_on: 0, lights_off: 0 });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io("http://localhost:8000", {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      requestFrame();
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    socketRef.current.on("frame", (data) => {
      if (imgRef.current) {
        imgRef.current.src = `data:image/jpeg;base64,${data.image}`;
      }
      setStats(data.stats);
      // Request next frame
      requestFrame();
    });

    socketRef.current.on("error", (error) => {
      console.error("Frame error:", error);
      setTimeout(requestFrame, 1000);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const requestFrame = () => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("get_frame", {});
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>VoltGuard Live Feed</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            padding: "10px 20px",
            backgroundColor: isConnected ? "#4CAF50" : "#9e9e9e",
            color: "white",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          {isConnected ? "● Connected" : "○ Disconnected"}
        </div>
        <div
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          Lights ON: {stats.lights_on}
        </div>
        <div
          style={{
            padding: "10px 20px",
            backgroundColor: "#f44336",
            color: "white",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          Lights OFF: {stats.lights_off}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#000",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <img
          ref={imgRef}
          alt="Live Video Feed"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}