import json
import psycopg2
from psycopg2.extras import RealDictCursor
from mcp.server.fastmcp import FastMCP
from datetime import date, datetime

# --- NEW IMPORTS FOR WEB SERVER ---
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# --- 1. SERVER INITIALIZATION ---
# We keep FastMCP, but we will attach it to FastAPI later
mcp = FastMCP("EnergyDatabase")

# --- 2. DATABASE CONFIGURATION ---
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

# --- 3. MCP TOOLS (The Interface) ---
# These remain exactly the same as your original script

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
        WHERE l.name ILIKE %s  -- Case-insensitive match
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
    

# --- 4. EXECUTION ---

# Initialize the standard FastAPI app
app = FastAPI(title="Energy MCP Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use the correct method to create the ASGI app for SSE
# Try 'sse_app()' first, if that fails, we use the manual mount approach
try:
    # This is the standard method for many FastMCP versions
    sse_handler = mcp.sse_app()
    app.mount("/mcp", sse_handler)
except AttributeError:
    # Fallback if your version uses a different name (common in newer SDKs)
    print("⚠️ 'sse_app' method not found. Trying manual startup...", file=sys.stderr)
    

if __name__ == "__main__":
    import sys
    print("🚀 Starting Energy MCP Server on http://localhost:9000/mcp/sse", file=sys.stderr)
    uvicorn.run(app, host="0.0.0.0", port=9000)