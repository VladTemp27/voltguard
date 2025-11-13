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
        frame_b64 = base64.b64enco from fastapi import FastAPI
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
        from concurrent.futures import ThreadPoolExecutor
        from datetime import datetime, timezone
        import time
        
        sys.path.insert(0, str(Path(__file__).parent.parent))
        from model.check import get_frame as get_video_frame, stats
        
        app = FastAPI()
        
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
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
        
        # Thread pool for blocking Redis operations
        executor = ThreadPoolExecutor(max_workers=1)
        
        # ✅ FIXED: Proper async Redis listener
        async def listen_for_notifications():
            """Listen to Redis pub/sub and broadcast notifications"""
            if not redis_client:
                return
            
            def _blocking_listener():
                pubsub = redis_client.pubsub()
                pubsub.subscribe('voltguard:notifications:new')
                print("[REDIS] Listening for notifications...")
                
                for message in pubsub.listen():
                    if message and message['type'] == 'message':
                        try:
                            notification = json.loads(message['data'])
                            asyncio.run_coroutine_threadsafe(
                                sio.emit('notification', notification),
                                asyncio.get_event_loop()
                            )
                            print(f"[BROADCAST] {notification['message']}")
                        except Exception as e:
                            print(f"[ERROR] Broadcast failed: {e}")
            
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(executor, _blocking_listener)
        
        @sio.event
        async def connect(sid, environ):
            print(f"[CONNECT] Client {sid}")
            
            if redis_client:
                try:
                    notifications = redis_client.lrange('voltguard:notifications', 0, 49)
                    notification_list = [json.loads(n) for n in reversed(notifications)]
                    
                    await sio.emit('notifications_batch', {
                        'notifications': notification_list,
                        'count': len(notification_list)
                    }, room=sid)
                except Exception as e:
                    print(f"[ERROR] {e}")
        
        @sio.event
        async def disconnect(sid):
            print(f"[DISCONNECT] Client {sid}")
        
        @sio.event
        async def get_frame(sid, data):
            frame_bytes, current_stats = get_video_frame()
            
            if frame_bytes:
                frame_b64 = base64.b64encode(frame_bytes).decode('utf-8')
                await sio.emit('frame', {'image': frame_b64, 'stats': current_stats}, room=sid)
            else:
                await sio.emit('error', {'message': 'Failed to grab frame'}, room=sid)
        
        @app.get("/stats")
        def get_stats():
            return stats
        
        @app.get("/notifications")
        def get_notifications(limit: int = 50):
            if not redis_client:
                return {"error": "Redis not available"}
            try:
                notifications = redis_client.lrange('voltguard:notifications', 0, limit - 1)
                return [json.loads(n) for n in notifications]
            except Exception as e:
                return {"error": str(e)}
        
        # ✅ NEW: Manual notification sender
        @app.post("/notifications/send")
        def send_notification(message: str, device: str = None, level: str = "info"):
            if not redis_client:
                return {"error": "Redis not available"}
            
            try:
                notification = {
                    "id": f"notif_{int(time.time() * 1000)}_{device or 'manual'}",
                    "message": message,
                    "device": device,
                    "level": level,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "read": False
                }
                
                redis_client.lpush('voltguard:notifications', json.dumps(notification))
                redis_client.ltrim('voltguard:notifications', 0, 99)
                redis_client.publish('voltguard:notifications:new', json.dumps(notification))
                
                return {"status": "sent", "notification": notification}
            except Exception as e:
                return {"error": str(e)}
        
        @app.delete("/notifications")
        def clear_notifications():
            if not redis_client:
                return {"error": "Redis not available"}
            try:
                redis_client.delete('voltguard:notifications')
                return {"status": "cleared"}
            except Exception as e:
                return {"error": str(e)}
        
        @app.on_event("startup")
        async def startup_event():
            if redis_client:
                existing_count = redis_client.llen('voltguard:notifications')
                
                if existing_count == 0:
                    # Add dummy notifications...
                    # ...existing code...
                    pass
                
                asyncio.create_task(listen_for_notifications())
        
        @app.on_event("shutdown")
        def shutdown_event():
            print("Shutting down...")
            executor.shutdown(wait=False)
        
        if __name__ == "__main__":
            uvicorn.run(socket_app, host="0.0.0.0", port=8000, log_level="info")
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