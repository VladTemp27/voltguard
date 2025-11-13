import psycopg2
import random
from faker import Faker
from datetime import datetime, timedelta
import uuid
import os
import dotenv

dotenv.load_dotenv()

# --- CONFIGURATION ---
DB_CONFIG = {
    "dbname": os.getenv("PG_DATABASE", "mydatabase"),
    "user": os.getenv("PG_USER", "postgres"),
    "password": os.getenv("PG_PASSWORD", "lou"),
    "host": "localhost",
    "port": os.getenv("PG_PORT", "5432")
}

# PHP per kWh (Average electricity rate in Philippines)
ELECTRICITY_RATE_PHP = 12.00 

fake = Faker()

# Realistic Device Profiles (Wattage ratings)
DEVICE_TYPES = {
    "Air Conditioner": {"watts": 1500, "standby": 0, "max_idle": 15},
    "Smart TV": {"watts": 150, "standby": 0.5, "max_idle": 30},
    "Desktop PC": {"watts": 250, "standby": 5, "max_idle": 60},
    "Lamp": {"watts": 15, "standby": 0, "max_idle": 120},
    "Electric Fan": {"watts": 70, "standby": 0, "max_idle": 45},
    "Heater": {"watts": 2000, "standby": 0, "max_idle": 10},
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def generate_locations(curr, count=5):
    print(f"📍 Generating {count} locations...")
    location_ids = []
    locations = ["Living Room", "Master Bedroom", "Kitchen", "Home Office", "Guest Room", "Garage"]
    
    for _ in range(count):
        loc_name = locations.pop(0) if locations else fake.word().capitalize() + " Room"
        loc_id = str(uuid.uuid4())
        
        curr.execute("""
            INSERT INTO locations (location_id, name, description)
            VALUES (%s, %s, %s)
        """, (loc_id, loc_name, fake.sentence()))
        location_ids.append(loc_id)
    
    return location_ids

def generate_devices(curr, location_ids, count=10):
    print(f"🔌 Generating {count} devices...")
    device_ids = []
    
    for _ in range(count):
        dev_type = random.choice(list(DEVICE_TYPES.keys()))
        specs = DEVICE_TYPES[dev_type]
        loc_id = random.choice(location_ids)
        dev_id = str(uuid.uuid4())
        
        # Ensure unique names per room (e.g., "Living Room Lamp")
        dev_name = f"{dev_type} {random.randint(1, 99)}"
        
        try:
            curr.execute("""
                INSERT INTO device_catalog 
                (device_id, location_id, device_name, avg_wattage_rating, 
                 standby_wattage_rating, max_allowed_idle_minutes)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (dev_id, loc_id, dev_name, specs['watts'], specs['standby'], specs['max_idle']))
            device_ids.append((dev_id, specs['watts'])) # Store wattage for calculation later
        except psycopg2.errors.UniqueViolation:
            # Skip duplicate names in same room
            pass
            
    return device_ids

def generate_waste_events(curr, device_list, count=100):
    print(f"⚠️ Generating {count} waste events...")
    
    for _ in range(count):
        # 1. Pick a random device
        device_id, wattage = random.choice(device_list)
        
        # 2. Randomize time in last 30 days
        event_time = fake.date_time_between(start_date='-30d', end_date='now')
        
        # 3. Randomize duration (10 mins to 12 hours)
        minutes_wasted = random.randint(10, 720)
        hours_wasted = minutes_wasted / 60.0
        
        # 4. Format Duration
        # Format as "HH:MM" for the raw JSON column
        hours_int = int(hours_wasted)
        mins_int = int((hours_wasted - hours_int) * 60)
        duration_raw = f"{hours_int:02}:{mins_int:02}"
        
        # Postgres INTERVAL format
        duration_interval = f"{minutes_wasted} minutes"
        
        # 5. Calculate Math
        kwh = (wattage * hours_wasted) / 1000.0
        cost = kwh * ELECTRICITY_RATE_PHP
        
        # 6. Insert
        curr.execute("""
            INSERT INTO waste_events 
            (device_id, detection_timestamp, duration_raw, duration_interval, 
             kwh_consumed, estimated_cost_php, confidence_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            device_id, 
            event_time, 
            duration_raw, 
            duration_interval, 
            round(kwh, 4), 
            round(cost, 2), 
            round(random.uniform(0.85, 0.99), 4)
        ))

def main():
    conn = get_db_connection()
    conn.autocommit = True
    curr = conn.cursor()
    
    try:
        loc_ids = generate_locations(curr, count=4)
        dev_list = generate_devices(curr, loc_ids, count=12)
        generate_waste_events(curr, dev_list, count=150)
        print("✅ Synthetic Data Generation Complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        curr.close()
        conn.close()

if __name__ == "__main__":
    main()