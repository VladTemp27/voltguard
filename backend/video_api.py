from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import sys
from pathlib import Path
import uvicorn
import signal

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from model.check import main_loop, stats


app = FastAPI()

@app.get("/video_feed")
def video_feed():
    return StreamingResponse(main_loop(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/stats")
def get_stats():
    return stats

@app.on_event("shutdown")
def shutdown_event():
    """Cleanup on shutdown"""
    print("Shutting down VoltGuard API...")
    # Release camera resources
    import cv2
    cv2.destroyAllWindows()

if __name__ == "__main__":
    def signal_handler(sig, frame):
        print("\nReceived termination signal. Shutting down gracefully...")
        sys.exit(0)
    
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)   # Ctrl+C
    signal.signal(signal.SIGTERM, signal_handler)  # kill command
    
    print("Starting VoltGuard API on http://0.0.0.0:8000")
    print("Access from other devices using your machine's IP address")
    print("Press Ctrl+C to stop")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

