from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import sys
from pathlib import Path
import uvicorn
import signal
import base64
import redis
import json
import asyncio
import os

sys.path.insert(0, str(Path(__file__).parent.parent))
from model.check import get_frame as get_video_frame, stats

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*'
)

# Wrap with ASGI app
socket_app = socketio.ASGIApp(sio, app)

# Redis connection
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

# THIS BROADCASTS THE LIVE NOTIFICATIONS
# Redis Pub/Sub listener
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
                # Broadcast to all connected Socket.IO clients
                await sio.emit('notification', notification)
                print(f"[BROADCAST] Notification sent to all clients: {notification['message']}")
            await asyncio.sleep(0.1)  # Non-blocking sleep
        except Exception as e:
            print(f"[ERROR] Redis listener error: {e}")
            await asyncio.sleep(1)  # Wait before retrying

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    
    # Send existing notifications to newly connected client
    if redis_client:
        try:
            notifications = redis_client.lrange('voltguard:notifications', 0, 49)  # Get last 50
            for notif_str in reversed(notifications):  # Reverse to get chronological order
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

@app.get("/stats")
def get_stats():
    return stats

@app.get("/notifications")
def get_notifications(limit: int = 50):
    """Get recent notifications from Redis"""
    if not redis_client:
        return {"error": "Redis not available"}
    
    try:
        notifications = redis_client.lrange('voltguard:notifications', 0, limit - 1)
        return [json.loads(n) for n in notifications]
    except Exception as e:
        return {"error": str(e)}

@app.delete("/notifications")
def clear_notifications():
    """Clear all notifications from Redis"""
    if not redis_client:
        return {"error": "Redis not available"}
    
    try:
        redis_client.delete('voltguard:notifications')
        return {"status": "notifications cleared"}
    except Exception as e:
        return {"error": str(e)}

@app.on_event("startup")
async def startup_event():
    """Start Redis listener on app startup"""
    if redis_client:
        # Add dummy notifications for testing (only if Redis is empty)
        try:
            existing_count = redis_client.llen('voltguard:notifications')
            
            if existing_count == 0:
                import time
                from datetime import datetime, timezone
                
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
    print("Shutting down VoltGuard API...")
    from model.check import camera
    if camera:
        camera.release()
    import cv2
    cv2.destroyAllWindows()

if __name__ == "__main__":
    def signal_handler(sig, frame):
        print("\nReceived termination signal. Shutting down gracefully...")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("Starting VoltGuard API on http://0.0.0.0:8000")
    print("Press Ctrl+C to stop")
    
    uvicorn.run(socket_app, host="0.0.0.0", port=8000, log_level="info")