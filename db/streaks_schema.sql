-- STREAK AND PET SYSTEM SCHEMA
-- Extends the existing VoltGuard database with user engagement tracking

-- 1. USERS TABLE (if not already exists)
-- Basic user information for the streak system
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. DAILY USAGE TABLE
-- Tracks user interaction and energy usage per day
CREATE TABLE daily_usage (
    usage_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL, -- Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
    usage_minutes INTEGER NOT NULL DEFAULT 0, -- Total app interaction time in minutes
    date DATE NOT NULL, -- Specific date of usage
    energy_efficiency_score NUMERIC(5, 2) DEFAULT 0, -- 0-100 score based on energy usage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_day CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    CONSTRAINT valid_usage CHECK (usage_minutes >= 0),
    CONSTRAINT valid_efficiency CHECK (energy_efficiency_score >= 0 AND energy_efficiency_score <= 100),
    UNIQUE(user_id, date) -- One entry per user per day
);

-- 3. STREAK TIERS ENUM
-- Defines the four-tier system
CREATE TYPE streak_tier AS ENUM ('Starter', 'Low Activity', 'Steady', 'High Performer');

-- 4. USER STREAKS TABLE
-- Tracks current streak status and tier for each user
CREATE TABLE user_streaks (
    streak_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
    current_streak_days INTEGER NOT NULL DEFAULT 0,
    best_streak_days INTEGER NOT NULL DEFAULT 0,
    current_tier streak_tier NOT NULL DEFAULT 'Starter',
    tier_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_date DATE,
    missed_days_count INTEGER NOT NULL DEFAULT 0, -- Consecutive missed days
    total_rewards_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_streak CHECK (current_streak_days >= 0),
    CONSTRAINT valid_best_streak CHECK (best_streak_days >= current_streak_days),
    CONSTRAINT valid_missed_days CHECK (missed_days_count >= 0)
);

-- 5. PET STATE TABLE
-- Links pet visual state to user's streak tier
CREATE TABLE pet_state (
    pet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
    pet_name VARCHAR(50) DEFAULT 'Spark',
    current_tier streak_tier NOT NULL DEFAULT 'Starter',
    pet_image_url VARCHAR(255) NOT NULL DEFAULT '/images/energy-pet-starter.png',
    pet_animation_state VARCHAR(50) DEFAULT 'idle', -- idle, happy, sleeping, glowing
    last_evolution_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TIER REWARDS TABLE
-- Defines rewards for each tier progression
CREATE TABLE tier_rewards (
    reward_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier streak_tier NOT NULL,
    reward_name VARCHAR(100) NOT NULL,
    reward_description TEXT,
    reward_image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tier, reward_name)
);

-- 7. USER REWARDS TABLE
-- Tracks which rewards users have earned
CREATE TABLE user_rewards (
    user_reward_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    reward_id UUID REFERENCES tier_rewards(reward_id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, reward_id)
);

-- INDEXES for performance
CREATE INDEX idx_daily_usage_user ON daily_usage(user_id, date DESC);
CREATE INDEX idx_daily_usage_week ON daily_usage(day_of_week);
CREATE INDEX idx_user_streaks_user ON user_streaks(user_id);
CREATE INDEX idx_pet_state_user ON pet_state(user_id);
CREATE INDEX idx_user_rewards_user ON user_rewards(user_id);

-- FUNCTION: Calculate tier based on streak and efficiency
CREATE OR REPLACE FUNCTION calculate_user_tier(
    p_streak_days INTEGER,
    p_avg_efficiency NUMERIC,
    p_missed_days INTEGER
) RETURNS streak_tier AS $$
BEGIN
    -- Drop to Low Activity if missed more than 2 days OR low efficiency
    IF p_missed_days > 2 OR p_avg_efficiency < 40 THEN
        RETURN 'Low Activity'::streak_tier;
    END IF;
    
    -- High Performer: 11+ days with good efficiency (60+)
    IF p_streak_days >= 11 AND p_avg_efficiency >= 60 THEN
        RETURN 'High Performer'::streak_tier;
    END IF;
    
    -- Steady: 4-10 days with acceptable efficiency (50+)
    IF p_streak_days >= 4 AND p_streak_days <= 10 AND p_avg_efficiency >= 50 THEN
        RETURN 'Steady'::streak_tier;
    END IF;
    
    -- Default to Starter
    RETURN 'Starter'::streak_tier;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION: Update streak on daily activity
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID) RETURNS VOID AS $$
DECLARE
    v_last_activity DATE;
    v_current_streak INTEGER;
    v_best_streak INTEGER;
    v_missed_days INTEGER;
    v_avg_efficiency NUMERIC;
    v_new_tier streak_tier;
    v_days_since_last INTEGER;
BEGIN
    -- Get current streak data
    SELECT last_activity_date, current_streak_days, best_streak_days, missed_days_count
    INTO v_last_activity, v_current_streak, v_best_streak, v_missed_days
    FROM user_streaks
    WHERE user_id = p_user_id;
    
    -- Calculate days since last activity
    v_days_since_last := COALESCE(CURRENT_DATE - v_last_activity, 0);
    
    -- Update streak logic
    IF v_last_activity IS NULL OR v_days_since_last = 1 THEN
        -- Continue streak
        v_current_streak := v_current_streak + 1;
        v_missed_days := 0;
    ELSIF v_days_since_last >= 2 THEN
        -- Reset streak if missed 2+ days
        v_missed_days := v_days_since_last;
        v_current_streak := 1; -- Start fresh
    ELSE
        -- Same day activity
        v_current_streak := v_current_streak;
    END IF;
    
    -- Update best streak
    v_best_streak := GREATEST(v_best_streak, v_current_streak);
    
    -- Calculate average efficiency from last 7 days
    SELECT COALESCE(AVG(energy_efficiency_score), 0)
    INTO v_avg_efficiency
    FROM daily_usage
    WHERE user_id = p_user_id
    AND date >= CURRENT_DATE - INTERVAL '7 days';
    
    -- Calculate new tier
    v_new_tier := calculate_user_tier(v_current_streak, v_avg_efficiency, v_missed_days);
    
    -- Update streak table
    UPDATE user_streaks
    SET current_streak_days = v_current_streak,
        best_streak_days = v_best_streak,
        current_tier = v_new_tier,
        last_activity_date = CURRENT_DATE,
        missed_days_count = v_missed_days,
        tier_updated_at = CASE WHEN current_tier != v_new_tier THEN CURRENT_TIMESTAMP ELSE tier_updated_at END,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;
    
    -- Update pet state to match tier
    UPDATE pet_state
    SET current_tier = v_new_tier,
        pet_image_url = CASE v_new_tier
            WHEN 'Starter' THEN '/images/energy-pet-starter.png'
            WHEN 'Low Activity' THEN '/images/energy-pet-bad.png'
            WHEN 'Steady' THEN '/images/energy-pet-medium.png'
            WHEN 'High Performer' THEN '/images/energy-pet-good.png'
        END,
        pet_animation_state = CASE v_new_tier
            WHEN 'Starter' THEN 'idle'
            WHEN 'Low Activity' THEN 'sleeping'
            WHEN 'Steady' THEN 'happy'
            WHEN 'High Performer' THEN 'glowing'
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER: Auto-update streak when daily usage is recorded
CREATE OR REPLACE FUNCTION trigger_update_streak() RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_user_streak(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_daily_usage_insert
AFTER INSERT ON daily_usage
FOR EACH ROW
EXECUTE FUNCTION trigger_update_streak();

-- VIEW: Weekly usage summary for charts
CREATE OR REPLACE VIEW weekly_usage_summary AS
SELECT 
    u.user_id,
    u.username,
    du.day_of_week,
    COALESCE(SUM(du.usage_minutes), 0) as total_usage_minutes,
    COALESCE(AVG(du.energy_efficiency_score), 0) as avg_efficiency,
    COUNT(du.usage_id) as activity_count
FROM users u
CROSS JOIN (
    VALUES ('Monday'), ('Tuesday'), ('Wednesday'), ('Thursday'), ('Friday'), ('Saturday'), ('Sunday')
) AS days(day_of_week)
LEFT JOIN daily_usage du ON u.user_id = du.user_id 
    AND du.day_of_week = days.day_of_week 
    AND du.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY u.user_id, u.username, du.day_of_week
ORDER BY u.user_id, 
    CASE du.day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
    END;

-- INSERT default tier rewards
INSERT INTO tier_rewards (tier, reward_name, reward_description) VALUES
('Starter', 'Welcome Badge', 'Started your energy-saving journey!'),
('Low Activity', 'Wake Up Call', 'Time to get back on track'),
('Steady', 'Consistent Saver', 'Maintaining good energy habits'),
('High Performer', 'Energy Champion', 'Master of energy efficiency!')
ON CONFLICT DO NOTHING;
