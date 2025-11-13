"""
Streak System API Endpoints
Handles user engagement tracking, tier progression, and pet state management
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

streaks_bp = Blueprint('streaks', __name__)

def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="voltguard",
        user="your_username",
        password="your_password",
        cursor_factory=RealDictCursor
    )

@streaks_bp.route('/api/streaks/<user_id>', methods=['GET'])
def get_user_streak(user_id):
    """
    Get complete streak data for a user
    Returns: current streak, best streak, tier, efficiency, pet state
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get streak data
        cur.execute("""
            SELECT 
                us.current_streak_days,
                us.best_streak_days,
                us.current_tier,
                us.missed_days_count,
                us.last_activity_date,
                ps.pet_name,
                ps.pet_image_url,
                ps.pet_animation_state
            FROM user_streaks us
            JOIN pet_state ps ON us.user_id = ps.user_id
            WHERE us.user_id = %s
        """, (user_id,))
        
        streak_data = cur.fetchone()
        
        if not streak_data:
            return jsonify({"error": "User not found"}), 404
        
        # Calculate average efficiency from last 7 days
        cur.execute("""
            SELECT COALESCE(AVG(energy_efficiency_score), 0) as avg_efficiency
            FROM daily_usage
            WHERE user_id = %s
            AND date >= CURRENT_DATE - INTERVAL '7 days'
        """, (user_id,))
        
        efficiency_data = cur.fetchone()
        
        # Count weekly goals met (days with >50% efficiency)
        cur.execute("""
            SELECT COUNT(*) as goals_met
            FROM daily_usage
            WHERE user_id = %s
            AND date >= CURRENT_DATE - INTERVAL '7 days'
            AND energy_efficiency_score >= 50
        """, (user_id,))
        
        goals_data = cur.fetchone()
        
        cur.close()
        conn.close()
        
        return jsonify({
            "currentStreak": streak_data['current_streak_days'],
            "bestStreak": streak_data['best_streak_days'],
            "currentTier": streak_data['current_tier'],
            "missedDays": streak_data['missed_days_count'],
            "avgEfficiency": round(efficiency_data['avg_efficiency'], 1),
            "weeklyGoalsMet": goals_data['goals_met'],
            "totalGoals": 7,
            "lastActivityDate": streak_data['last_activity_date'].isoformat() if streak_data['last_activity_date'] else None,
            "petState": {
                "name": streak_data['pet_name'],
                "tier": streak_data['current_tier'],
                "imageUrl": streak_data['pet_image_url'],
                "animationState": streak_data['pet_animation_state']
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@streaks_bp.route('/api/usage/weekly/<user_id>', methods=['GET'])
def get_weekly_usage(user_id):
    """
    Get weekly usage data for chart display
    Returns: usage minutes and efficiency for each day of the week
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get last 7 days of data
        cur.execute("""
            SELECT 
                day_of_week,
                SUM(usage_minutes) as total_usage,
                AVG(energy_efficiency_score) as avg_efficiency
            FROM daily_usage
            WHERE user_id = %s
            AND date >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY day_of_week
            ORDER BY 
                CASE day_of_week
                    WHEN 'Monday' THEN 1
                    WHEN 'Tuesday' THEN 2
                    WHEN 'Wednesday' THEN 3
                    WHEN 'Thursday' THEN 4
                    WHEN 'Friday' THEN 5
                    WHEN 'Saturday' THEN 6
                    WHEN 'Sunday' THEN 7
                END
        """, (user_id,))
        
        usage_data = cur.fetchall()
        
        # Create complete week with zeros for missing days
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        usage_dict = {row['day_of_week']: row for row in usage_data}
        
        weekly_usage = []
        for day in days:
            if day in usage_dict:
                weekly_usage.append({
                    "day": day,
                    "usage": usage_dict[day]['total_usage'],
                    "efficiency": round(usage_dict[day]['avg_efficiency'], 1)
                })
            else:
                weekly_usage.append({
                    "day": day,
                    "usage": 0,
                    "efficiency": 0
                })
        
        cur.close()
        conn.close()
        
        return jsonify({"weeklyUsage": weekly_usage})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@streaks_bp.route('/api/usage/daily', methods=['POST'])
def record_daily_usage():
    """
    Record daily usage activity
    Automatically updates streak and tier via database trigger
    """
    try:
        data = request.json
        user_id = data.get('userId')
        date = data.get('date')
        day_of_week = data.get('dayOfWeek')
        usage_minutes = data.get('usageMinutes')
        efficiency_score = data.get('energyEfficiencyScore')
        
        if not all([user_id, date, day_of_week, usage_minutes is not None]):
            return jsonify({"error": "Missing required fields"}), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get old tier
        cur.execute("""
            SELECT current_tier FROM user_streaks WHERE user_id = %s
        """, (user_id,))
        
        old_tier_data = cur.fetchone()
        old_tier = old_tier_data['current_tier'] if old_tier_data else 'Starter'
        
        # Insert or update daily usage (trigger will fire automatically)
        cur.execute("""
            INSERT INTO daily_usage (user_id, day_of_week, usage_minutes, date, energy_efficiency_score)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (user_id, date) 
            DO UPDATE SET 
                usage_minutes = daily_usage.usage_minutes + EXCLUDED.usage_minutes,
                energy_efficiency_score = EXCLUDED.energy_efficiency_score
        """, (user_id, day_of_week, usage_minutes, date, efficiency_score))
        
        # Get new tier after trigger
        cur.execute("""
            SELECT current_tier FROM user_streaks WHERE user_id = %s
        """, (user_id,))
        
        new_tier_data = cur.fetchone()
        new_tier = new_tier_data['current_tier'] if new_tier_data else 'Starter'
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "streakUpdated": True,
            "newTier": new_tier,
            "tierChanged": old_tier != new_tier
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@streaks_bp.route('/api/streaks/initialize/<user_id>', methods=['POST'])
def initialize_user_streak(user_id):
    """
    Initialize streak and pet state for a new user
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if user exists
        cur.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
        if not cur.fetchone():
            # Create user if doesn't exist
            cur.execute("""
                INSERT INTO users (user_id, username, created_at)
                VALUES (%s, %s, CURRENT_TIMESTAMP)
            """, (user_id, f"user_{user_id[:8]}"))
        
        # Initialize streak
        cur.execute("""
            INSERT INTO user_streaks (user_id)
            VALUES (%s)
            ON CONFLICT (user_id) DO NOTHING
        """, (user_id,))
        
        # Initialize pet
        cur.execute("""
            INSERT INTO pet_state (user_id)
            VALUES (%s)
            ON CONFLICT (user_id) DO NOTHING
        """, (user_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "User streak and pet initialized"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@streaks_bp.route('/api/rewards/<user_id>', methods=['GET'])
def get_user_rewards(user_id):
    """
    Get all rewards earned by user
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                tr.tier,
                tr.reward_name,
                tr.reward_description,
                tr.reward_image_url,
                ur.earned_at
            FROM user_rewards ur
            JOIN tier_rewards tr ON ur.reward_id = tr.reward_id
            WHERE ur.user_id = %s
            ORDER BY ur.earned_at DESC
        """, (user_id,))
        
        rewards = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({"rewards": rewards})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Register blueprint in your main Flask app:
# app.register_blueprint(streaks_bp)
