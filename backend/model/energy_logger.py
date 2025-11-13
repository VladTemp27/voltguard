# energy_logger.py
import json
import time
from datetime import datetime, timezone
import redis
import os

POWER_RATINGS = {"laptop": 0.05, "lamp": 0.01, "tv": 0.1}
COST_PER_KWH = 0.4  # PHP per kWh

# Store all waste events for one "absence session"
waste_session_records = []

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


def log_waste_start(device, start_time):
    """Mark the start of a waste event (human absent but device still on)."""
    message = f"{device} left ON — tracking waste duration."
    print(f"[START] {message}")
    
    # Push notification to Redis
    if redis_client:
        try:
            notification = {
                "id": f"notif_{int(time.time() * 1000)}",
                "message": message,
                "device": device,
                "level": "warning",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "read": False
            }
            # Push to Redis list (notifications queue)
            redis_client.lpush('voltguard:notifications', json.dumps(notification))
            # Publish to pub/sub channel for real-time updates
            redis_client.publish('voltguard:notifications:new', json.dumps(notification))
            print(f"[REDIS] Notification pushed: {message}")
        except Exception as e:
            print(f"[REDIS] Failed to push notification: {e}")


def log_waste_end(device, start_time, end_time):
    """Store end event data in memory (no saving yet)."""
    duration = float(end_time) - float(start_time)
    duration_hours = duration / 3600
    kwh_wasted = POWER_RATINGS.get(device, 0.05) * duration_hours
    est_cost = kwh_wasted * COST_PER_KWH

    data = {
        "name": device,
        "duration_hours": round(duration_hours, 4),
        "kwh_wasted": round(kwh_wasted, 5),
        "est_cost": round(est_cost, 4)
    }

    waste_session_records.append(data)
    print(f"[END] {device} wasted energy for {round(duration, 2)} seconds (queued for save).")


def save_all_once():
    """Save all collected waste events in one summary JSON."""
    if not waste_session_records:
        print("[INFO] No waste data to save for this session.")
        return

    summary = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event_id": f"evt_{int(time.time())}",
        "devices": waste_session_records
    }

    with open("waste_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print(f"[SAVED] Waste summary saved for {len(waste_session_records)} devices.")
    waste_session_records.clear()  # clear after saving for next session
