import json
import psycopg2
from psycopg2.extras import RealDictCursor
from mcp.server.fastmcp import FastMCP
from datetime import date, datetime
import sys
from pathlib import Path

# FastAPI and middleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Socket.IO
import socketio
import signal
import base64
import redis
import asyncio
import os

# Import video detection
sys.path.insert(0, str(Path(__file__).parent.parent))
from model.check import get_frame as get_video_frame, stats

# --- 1. DATABASE CONFIGURATION ---
DB_CONFIG = {
    "dbname": "mydatabase",
    "user": "postgres",
    "password": "lou",
    "host": "127.0.0.1",
    "port": "5432"
}

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    return psycopg2.connect(**DB_CONFIG)

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    return str(obj)

# --- 2. MCP SERVER INITIALIZATION ---
mcp = FastMCP("EnergyDatabase")

# --- 3. MCP TOOLS ---
@mcp.tool()
def get_waste_summary_by_location(start_date: str, end_date: str) -> str:
    """
    Generates a financial report of energy waste grouped by location/room.
    Use this when the user asks "Which room is costing me the most?"
    
    Args:
        start_date: 'YYYY-MM-DD'
        end_date: 'YYYY-MM-DD'
    """
    query = """
        SELECT 
            l.name AS location_name,
            COUNT(we.event_id) AS total_events,
            SUM(we.duration_hours) AS total_hours_wasted,
            SUM(we.kwh_consumed) AS total_kwh,
            SUM(we.estimated_cost_php) AS total_cost_php
        FROM waste_events we
        JOIN device_catalog dc ON we.device_id = dc.device_id
        JOIN locations l ON dc.location_id = l.location_id
        WHERE we.detection_timestamp::date BETWEEN %s AND %s
        GROUP BY l.name
        ORDER BY total_cost_php DESC
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, (start_date, end_date))
                results = cur.fetchall()
                return json.dumps([dict(r) for r in results], default=json_serial, indent=2)
    except Exception as e:
        return f"Error querying database: {str(e)}"

@mcp.tool()
def get_top_offending_devices(limit: int = 5) -> str:
    """
    Identifies specific devices that are the worst offenders for energy waste.
    Includes technical specs (wattage) to explain high costs.
    
    Args:
        limit: Number of devices to return (default 5)
    """
    query = """
        SELECT 
            dc.device_name,
            l.name AS location,
            dc.avg_wattage_rating AS wattage,
            COUNT(we.event_id) AS waste_frequency,
            SUM(we.estimated_cost_php) AS total_cost_php
        FROM waste_events we
        JOIN device_catalog dc ON we.device_id = dc.device_id
        JOIN locations l ON dc.location_id = l.location_id
        GROUP BY dc.device_name, l.name, dc.avg_wattage_rating
        ORDER BY total_cost_php DESC
        LIMIT %s
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, (limit,))
                results = cur.fetchall()
                return json.dumps([dict(r) for r in results], default=json_serial, indent=2)
    except Exception as e:
        return f"Error querying database: {str(e)}"

@mcp.tool()
def get_waste_heatmap_by_hour() -> str:
    """
    Analyzes time-of-day patterns to find when waste usually occurs.
    Essential for 'Prescriptive' analytics (e.g., "You leave lights on at 6 PM").
    """
    query = """
        SELECT 
            EXTRACT(HOUR FROM we.detection_timestamp) AS hour_of_day,
            COUNT(we.event_id) AS incident_count,
            SUM(we.estimated_cost_php) AS total_cost_php
        FROM waste_events we
        GROUP BY hour_of_day
        ORDER BY total_cost_php DESC
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query)
                results = cur.fetchall()
                data = json.dumps([dict(r) for r in results], default=json_serial)
                return f"Hourly Waste Analysis (0-23 hour format):\n{data}"
    except Exception as e:
        return f"Error querying database: {str(e)}"

@mcp.tool()
def get_confidence_check(threshold: float = 0.8) -> str:
    """
    Audits the system's performance. Returns events where the Computer Vision
    model was unsure (low confidence), but waste was logged anyway.
    """
    query = """
        SELECT 
            we.event_id,
            dc.device_name,
            we.confidence_score,
            we.detection_timestamp
        FROM waste_events we
        JOIN device_catalog dc ON we.device_id = dc.device_id
        WHERE we.confidence_score < %s
        ORDER BY we.confidence_score ASC
        LIMIT 10
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, (threshold,))
                results = cur.fetchall()
                if not results:
                    return "No low-confidence detections found. System is healthy."
                return json.dumps([dict(r) for r in results], default=json_serial)
    except Exception as e:
        return f"Error querying database: {str(e)}"

@mcp.tool()
def get_devices_by_location(location_name: str) -> str:
    """
    Lists all devices in a specific room and their individual waste contribution.
    Use this when a user asks "Why is the [Room Name] so expensive?"
    """
    query = """
        SELECT 
            dc.device_name,
            dc.avg_wattage_rating,
            COUNT(we.event_id) as events,
            SUM(we.estimated_cost_php) as total_cost
        FROM waste_events we
        JOIN device_catalog dc ON we.device_id = dc.device_id
        JOIN locations l ON dc.location_id = l.location_id
        WHERE l.name ILIKE %s
        GROUP BY dc.device_name, dc.avg_wattage_rating
        ORDER BY total_cost DESC
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, (f"%{location_name}%",))
                results = cur.fetchall()
                if not results:
                    return f"No devices found for location: {location_name}"
                return json.dumps([dict(r) for r in results], default=json_serial, indent=2)
    except Exception as e:
        return f"Error: {str(e)}"
    
@mcp.tool()
def get_weekly_trend_comparison() -> str:
    """
    Compares this week's total waste cost vs. last week's.
    Returns a percentage change. Use for 'progress' or 'trend' questions.
    """
    query = """
        WITH this_week AS (
            SELECT SUM(estimated_cost_php) as cost 
            FROM waste_events 
            WHERE detection_timestamp >= NOW() - INTERVAL '7 days'
        ),
        last_week AS (
            SELECT SUM(estimated_cost_php) as cost 
            FROM waste_events 
            WHERE detection_timestamp >= NOW() - INTERVAL '14 days' 
            AND detection_timestamp < NOW() - INTERVAL '7 days'
        )
        SELECT 
            COALESCE((SELECT cost FROM this_week), 0) as current_week_cost,
            COALESCE((SELECT cost FROM last_week), 0) as previous_week_cost
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query)
                res = cur.fetchone()
                curr = float(res['current_week_cost'])
                prev = float(res['previous_week_cost'])
                
                diff = curr - prev
                if prev > 0:
                    percent = (diff / prev) * 100
                else:
                    percent = 100 if curr > 0 else 0
                
                return json.dumps({
                    "status": "worse" if diff > 0 else "better",
                    "current_week_php": curr,
                    "previous_week_php": prev,
                    "change_percent": round(percent, 2)
                })
    except Exception as e:
        return f"Error: {str(e)}"
    
@mcp.tool()
def get_recent_logs(limit: int = 5) -> str:
    """
    Fetches the raw log of the most recent waste detection events.
    Use this if the user asks "What just happened?" or "Show me the latest alerts."
    """
    query = """
        SELECT 
            we.detection_timestamp,
            dc.device_name,
            l.name as location,
            we.duration_hours
        FROM waste_events we
        JOIN device_catalog dc ON we.device_id = dc.device_id
        JOIN locations l ON dc.location_id = l.location_id
        ORDER BY we.detection_timestamp DESC
        LIMIT %s
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, (limit,))
                return json.dumps([dict(r) for r in cur.fetchall()], default=json_serial, indent=2)
    except Exception as e:
        return f"Error: {str(e)}"

# --- 4. FASTAPI APP INITIALIZATION ---
app = FastAPI(title="VoltGuard Unified Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 5. SOCKET.IO SETUP ---
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*'
)

# Wrap with ASGI app
socket_app = socketio.ASGIApp(sio, app)

# --- 6. REDIS CONNECTION ---
try:
    redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        password=os.getenv('REDIS_PASSWORD', 'securepassword'),
        decode_responses=True
    )
    redis_client.ping()
    print("[REDIS] Connected successfully")
except Exception as e:
    print(f"[REDIS] Connection failed: {e}")
    redis_client = None

# --- 7. REDIS PUB/SUB LISTENER ---
async def listen_for_notifications():
    """Listen to Redis pub/sub for new notifications and broadcast to all connected clients"""
    if not redis_client:
        return
    
    pubsub = redis_client.pubsub()
    pubsub.subscribe('voltguard:notifications:new')
    
    print("[REDIS] Listening for notifications...")
    
    while True:
        try:
            message = pubsub.get_message(ignore_subscribe_messages=True, timeout=0.1)
            if message and message['type'] == 'message':
                notification = json.loads(message['data'])
                await sio.emit('notification', notification)
                print(f"[BROADCAST] Notification sent to all clients: {notification['message']}")
            await asyncio.sleep(0.1)
        except Exception as e:
            print(f"[ERROR] Redis listener error: {e}")
            await asyncio.sleep(1)

# --- 8. SOCKET.IO EVENTS ---
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    
    # Send existing notifications to newly connected client
    if redis_client:
        try:
            notifications = redis_client.lrange('voltguard:notifications', 0, 49)
            for notif_str in reversed(notifications):
                notification = json.loads(notif_str)
                await sio.emit('notification', notification, room=sid)
        except Exception as e:
            print(f"[ERROR] Failed to send existing notifications: {e}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def get_frame(sid, data):
    frame_bytes, current_stats = get_video_frame()
    
    if frame_bytes:
        frame_b64 = base64.b64encode(frame_bytes).decode('utf-8')
        await sio.emit('frame', {
            'image': frame_b64,
            'stats': current_stats
        }, room=sid)
    else:
        await sio.emit('error', {'message': 'Failed to grab frame'}, room=sid)

# --- 9. VIDEO API ENDPOINTS ---
@app.get("/api/stats")
def get_stats():
    """Get current video detection stats"""
    return stats

@app.get("/api/video_feed")
def video_feed():
    """HTTP video stream endpoint (multipart/x-mixed-replace)"""
    from fastapi.responses import StreamingResponse
    
    def generate_frames():
        while True:
            frame_bytes, current_stats = get_video_frame()
            if frame_bytes:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.get("/api/notifications")
def get_notifications(limit: int = 50):
    """Get recent notifications from Redis"""
    if not redis_client:
        return {"error": "Redis not available"}
    
    try:
        notifications = redis_client.lrange('voltguard:notifications', 0, limit - 1)
        return [json.loads(n) for n in notifications]
    except Exception as e:
        return {"error": str(e)}

@app.delete("/api/notifications")
def clear_notifications():
    """Clear all notifications from Redis"""
    if not redis_client:
        return {"error": "Redis not available"}
    
    try:
        redis_client.delete('voltguard:notifications')
        return {"status": "notifications cleared"}
    except Exception as e:
        return {"error": str(e)}

# --- 10. MCP ENDPOINT ---
# Mount MCP before wrapping with Socket.IO
try:
    sse_handler = mcp.sse_app()
    app.mount("/lou/mcp", sse_handler)
    print("[MCP] Mounted at /lou/mcp/sse")
except AttributeError as e:
    print(f"⚠️ 'sse_app' method not found in FastMCP: {e}", file=sys.stderr)
except Exception as e:
    print(f"⚠️ Failed to mount MCP: {e}", file=sys.stderr)

# --- 11. STARTUP & SHUTDOWN EVENTS ---
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    if redis_client:
        # Add dummy notifications for testing (only if Redis is empty)
        try:
            existing_count = redis_client.llen('voltguard:notifications')
            
            if existing_count == 0:
                import time
                from datetime import timezone
                
                dummy_notifications = [
                    {
                        "id": f"notif_{int(time.time() * 1000)}_1",
                        "message": "Laptop left ON — tracking waste duration.",
                        "device": "laptop",
                        "level": "warning",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "read": False
                    },
                    {
                        "id": f"notif_{int(time.time() * 1000)}_2",
                        "message": "TV detected running for extended period",
                        "device": "tv",
                        "level": "warning",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "read": False
                    },
                    {
                        "id": f"notif_{int(time.time() * 1000)}_3",
                        "message": "High energy consumption detected in Living Room",
                        "device": "lamp",
                        "level": "error",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "read": False
                    },
                    {
                        "id": f"notif_{int(time.time() * 1000)}_4",
                        "message": "Camera connection established",
                        "device": None,
                        "level": "info",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "read": True
                    }
                ]
                
                for notif in dummy_notifications:
                    redis_client.lpush('voltguard:notifications', json.dumps(notif))
                
                print(f"[REDIS] Added {len(dummy_notifications)} dummy notifications")
            else:
                print(f"[REDIS] Found {existing_count} existing notifications, skipping dummy data")
        except Exception as e:
            print(f"[ERROR] Failed to add dummy notifications: {e}")
        
        asyncio.create_task(listen_for_notifications())

@app.on_event("shutdown")
def shutdown_event():
    """Cleanup on shutdown"""
    print("Shutting down VoltGuard Unified Server...")
    from model.check import camera
    if camera:
        camera.release()
    import cv2
    cv2.destroyAllWindows()

# --- 12. MAIN EXECUTION ---
if __name__ == "__main__":
    def signal_handler(sig, frame):
        print("\nReceived termination signal. Shutting down gracefully...")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("=" * 60)
    print("🚀 VoltGuard Unified Server Starting")
    print("=" * 60)
    print("📹 Video API:     http://0.0.0.0:8000/api/*")
    print("🔌 Socket.IO:     http://0.0.0.0:8000/socket.io/")
    print("🤖 MCP Server:    http://0.0.0.0:8000/lou/mcp/sse")
    print("📊 Notifications: http://0.0.0.0:8000/api/notifications")
    print("=" * 60)
    print("Press Ctrl+C to stop")
    print()
    
    uvicorn.run(socket_app, host="0.0.0.0", port=8000, log_level="info")
