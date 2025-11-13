import cv2
from ultralytics import YOLO
import numpy as np
import time
from datetime import datetime, timezone
import energy_logger as logger  # direct import ✅

# --- Initialize model and globals ---
model = YOLO("weights.pt")
camera = None

POWER_RATINGS = {"laptop": 0.05, "lamp": 0.01, "screen": 0.1}
HUMAN_ABSENT_THRESHOLD = 20  # seconds

device_log = {}
human_last_seen = time.time()
human_present = True
active_waste_events = {}


# -------------------------------
# CAMERA + FRAME FUNCTIONS
# -------------------------------
def get_camera():
    """Lazy camera initialization"""
    global camera
    if camera is None or not camera.isOpened():
        camera = cv2.VideoCapture(0)
    return camera


def analyze_light(crop):
    """Detect if a bright object (like a laptop or bulb) is ON."""
    if crop.size == 0:
        return False
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    center_crop = gray[h // 4: 3 * h // 4, w // 4: 3 * w // 4]
    return np.max(center_crop) > 250


def update_device_status(name, is_on):
    """Update or initialize device ON/OFF status"""
    if name not in device_log:
        device_log[name] = {"is_on": False, "last_change": time.time()}
    device_log[name]["is_on"] = is_on
    device_log[name]["last_change"] = time.time()


def get_frame():
    """Read a single frame and perform detection"""
    global human_present, human_last_seen, active_waste_events

    cap = get_camera()
    success, frame = cap.read()
    if not success:
        return None

    results = model(frame, stream=True)
    detected_classes = set()

    # --- Detection Loop ---
    for r in results:
        if hasattr(r, "boxes") and r.boxes is not None:
            for i, c in enumerate(r.boxes.cls):
                name = model.names[int(c)]
                detected_classes.add(name)

                x1, y1, x2, y2 = map(int, r.boxes.xyxy[i])
                crop = frame[y1:y2, x1:x2]

                if name in POWER_RATINGS:
                    is_on = analyze_light(crop)
                    update_device_status(name, is_on)
                    color = (0, 255, 0) if is_on else (0, 0, 255)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame, f"{name}: {'ON' if is_on else 'OFF'}",
                                (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                else:
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 0), 2)
                    cv2.putText(frame, name, (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

    # --- Human Presence Detection ---
    if "person" in detected_classes:
        human_present = True
        human_last_seen = time.time()
    else:
        if time.time() - human_last_seen > HUMAN_ABSENT_THRESHOLD:
            human_present = False
        else:
            human_present = True
    

    # --- Energy Waste Detection ---
    for device, record in device_log.items():
        if record["is_on"] and not human_present:
            if device not in active_waste_events:
                start_time = time.time()
                active_waste_events[device] = start_time
                logger.log_waste_start(device, start_time)
                print(f"⚠️ Waste detected for {device} (human absent 20s).")

    # ✅ When human returns, finalize all at once
    if human_present and active_waste_events:
        print("✅ Human returned — finalizing all waste logs...")
        for device, start_time in list(active_waste_events.items()):
            end_time = time.time()
            logger.log_waste_end(device, start_time, end_time)
            del active_waste_events[device]

        logger.save_all_once()

    # --- Display Human Info ---
    cv2.putText(frame, f"Human: {'Present' if human_present else 'Absent'}",
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                (0, 255, 0) if human_present else (0, 0, 255), 2)

    return frame


# -------------------------------
# MAIN LOOP
# -------------------------------
def main_loop():
    """Run VoltGuard detection continuously"""
    print("Starting VoltGuard Detection...")
    while True:
        frame = get_frame()
        if frame is None:
            print("Camera not available.")
            break

        cv2.imshow("VoltGuard Live", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    if camera:
        camera.release()
    cv2.destroyAllWindows()
    print("VoltGuard stopped.")


if __name__ == "__main__":
    main_loop()
