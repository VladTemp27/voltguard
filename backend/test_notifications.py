"""
VoltGuard Notification System Tester
Interactive script to test the notification system
"""

import requests
import time
import random
import json
from datetime import datetime, timezone

BASE_URL = "http://localhost:8000"

# Test data
DEVICES = ["laptop", "tv", "air_conditioner", "lamp", "heater", "washing_machine"]
MESSAGE_TEMPLATES = [
    "{} left ON — tracking waste duration",
    "{} detected running for extended period",
    "High energy consumption from {}",
    "{} power surge detected",
    "Unusual {} activity detected",
    "{} has been idle for too long"
]
LEVELS = ["info", "warning", "error"]

def check_backend():
    """Check if backend is running"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on port 8000")
        print("   Run: cd backend && python api_server.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def get_notifications():
    """Fetch all notifications"""
    try:
        response = requests.get(f"{BASE_URL}/notifications")
        notifications = response.json()
        
        if isinstance(notifications, list):
            print(f"\n📨 Found {len(notifications)} notifications:")
            for i, notif in enumerate(notifications[:5], 1):
                print(f"  {i}. [{notif.get('level', 'N/A')}] {notif.get('message', 'N/A')}")
            if len(notifications) > 5:
                print(f"  ... and {len(notifications) - 5} more")
        else:
            print(f"❌ Unexpected response: {notifications}")
    except Exception as e:
        print(f"❌ Error fetching notifications: {e}")

def send_notification(device, message, level="warning"):
    """Send a single notification"""
    try:
        response = requests.post(
            f"{BASE_URL}/notifications/send",
            params={
                "message": message,
                "device": device,
                "level": level
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Sent: {message} [{level}]")
            return result
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def send_single_test():
    """Send one test notification"""
    print("\n" + "="*60)
    print("📨 Sending Single Test Notification")
    print("="*60)
    
    device = input("\nDevice name (default: test_device): ").strip() or "test_device"
    message = input("Message (default: Test notification): ").strip() or "Test notification from Python!"
    level = input("Level [info/warning/error] (default: warning): ").strip() or "warning"
    
    if level not in LEVELS:
        print(f"⚠️  Invalid level. Using 'warning'")
        level = "warning"
    
    result = send_notification(device, message, level)
    
    if result:
        print("\n✅ Success! Check your browser for the notification.")
        print(f"   Notification ID: {result.get('notification', {}).get('id', 'N/A')}")

def send_spam_notifications():
    """Send multiple random notifications"""
    print("\n" + "="*60)
    print("🚀 Spam Test - Multiple Notifications")
    print("="*60)
    
    count = input("\nHow many notifications to send? (default: 10): ").strip()
    count = int(count) if count.isdigit() else 10
    
    delay = input("Delay between notifications in seconds? (default: 1): ").strip()
    delay = float(delay) if delay.replace('.', '').isdigit() else 1.0
    
    print(f"\nSending {count} notifications with {delay}s delay...\n")
    
    for i in range(count):
        device = random.choice(DEVICES)
        template = random.choice(MESSAGE_TEMPLATES)
        message = template.format(device.upper())
        level = random.choice(LEVELS)
        
        send_notification(device, message, level)
        
        if i < count - 1:  # Don't delay after last one
            time.sleep(delay)
    
    print(f"\n✅ Sent {count} notifications! Check your browser.")

def clear_all_notifications():
    """Clear all notifications from Redis"""
    print("\n" + "="*60)
    print("🗑️  Clear All Notifications")
    print("="*60)
    
    confirm = input("\nAre you sure? This will delete all notifications. (yes/no): ").strip().lower()
    
    if confirm == 'yes':
        try:
            response = requests.delete(f"{BASE_URL}/notifications")
            result = response.json()
            print(f"✅ {result.get('status', 'Cleared')}")
        except Exception as e:
            print(f"❌ Error: {e}")
    else:
        print("❌ Cancelled")

def test_streaks_api():
    """Test the streaks API endpoints"""
    print("\n" + "="*60)
    print("🎮 Testing Streaks API")
    print("="*60)
    
    endpoints = [
        ("Streak Data", "/api/streaks"),
        ("Weekly Usage", "/api/usage/weekly"),
        ("Rewards", "/api/rewards")
    ]
    
    for name, endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            if response.status_code == 200:
                data = response.json()
                print(f"\n✅ {name}:")
                print(f"   {json.dumps(data, indent=2)[:200]}...")
            else:
                print(f"❌ {name}: Status {response.status_code}")
        except Exception as e:
            print(f"❌ {name}: {e}")

def main_menu():
    """Display main menu"""
    while True:
        print("\n" + "="*60)
        print("🔔 VoltGuard Notification System Tester")
        print("="*60)
        print("\n1. Check Backend Status")
        print("2. View All Notifications")
        print("3. Send Single Test Notification")
        print("4. Send Multiple Random Notifications")
        print("5. Clear All Notifications")
        print("6. Test Streaks API")
        print("7. Exit")
        
        choice = input("\nChoice: ").strip()
        
        if choice == "1":
            check_backend()
        elif choice == "2":
            get_notifications()
        elif choice == "3":
            send_single_test()
        elif choice == "4":
            send_spam_notifications()
        elif choice == "5":
            clear_all_notifications()
        elif choice == "6":
            test_streaks_api()
        elif choice == "7":
            print("\n👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    print("\n🚀 Starting VoltGuard Notification Tester...")
    
    # Initial check
    if not check_backend():
        print("\n💡 Start the backend first:")
        print("   cd backend")
        print("   python api_server.py")
        print("\nThen run this script again.")
    else:
        main_menu()
