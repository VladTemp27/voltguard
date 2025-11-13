import cv2
from ultralytics import YOLO
import numpy as np

# --- Initialize model and camera ---
model = YOLO("yolov8n.pt")  # or your custom-trained model
#camera = cv2.VideoCapture(0)  # 0 for webcam, or replace with video path

# COCO class index for laptop is 64

stats = {"lights_on": 0, "lights_off": 0}

def analyze_light(crop):
    """
    Detect if a bright object (like a laptop screen or bulb) is ON.
    Checks the maximum intensity in the central region of the crop.
    """
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    center_crop = gray[h//4:3*h//4, w//4:3*w//4]
    max_intensity = np.max(center_crop)
    return max_intensity > 250  # adjust threshold for your lighting

def main_loop():
    global stats
    camera = cv2.VideoCapture(0)  # Initialize camera here
    while True:
        success, frame = camera.read()
        if not success:
            print("Failed to grab frame.")
            break

        stats["lights_on"] = 0
        stats["lights_off"] = 0

        results = model(frame, stream=True)
        for r in results:
            if hasattr(r, 'boxes') and r.boxes is not None:
                boxes = r.boxes
                cls = boxes.cls
                xyxy = boxes.xyxy

                for i, c in enumerate(cls):

                    x1, y1, x2, y2 = map(int, xyxy[i])
                    crop = frame[y1:y2, x1:x2]

                    # Detect if "ON" or "OFF"
                    if model.names[int(c)] == 'laptop':
                        is_on = analyze_light(crop)
                        status_text = "ON" if is_on else "OFF"
                        color = (0, 255, 0) if is_on else (0, 0, 255)
                        cv2.putText(frame, f"Laptop: {status_text}", (x1, y1 - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                        if is_on:
                            stats["lights_on"] += 1
                        else:
                            stats["lights_off"] += 1

                    # Draw bounding box and class label
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 0), 2)
                    cv2.putText(frame, model.names[int(c)], (x1, y1 - 25),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

        # Display stats
        cv2.putText(frame, f"Lights ON: {stats['lights_on']}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, f"Lights OFF: {stats['lights_off']}", (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)


        #could resize the frame later for faster streaming
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 50]
        # Encode frame and yield for streaming
        ret, buffer = cv2.imencode('.jpg', frame)
        if ret:
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')


        # Show the frame (only when running standalone)
        if __name__ == "__main__":
            cv2.imshow("VoltGuard Live", frame)
            # Exit on 'q' key
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    camera.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main_loop()
    for _ in main_loop():
        pass  # Generator yields frames and displays them
