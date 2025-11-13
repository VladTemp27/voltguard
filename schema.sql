-- Enable UUID extension for unique identifiers (industry standard for scaling)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LOCATIONS
-- Describes where the CV camera is looking (e.g., "Living Room", "Office A")
CREATE TABLE locations (
    location_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. DEVICE CATALOG
-- Stores the static "physics" of your items (Wattage is crucial for the math)
CREATE TABLE device_catalog (
    device_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(location_id),
    device_name VARCHAR(50) NOT NULL, -- e.g., "lamp", "tv"
    
    -- Technical specs for calculations
    avg_wattage_rating INTEGER NOT NULL, -- In Watts (e.g., TV = 150)
    standby_wattage_rating INTEGER DEFAULT 0, -- Ghost power consumption
    
    -- Prescriptive Logic Data:
    -- If a device is idle longer than this, it's a violation.
    max_allowed_idle_minutes INTEGER DEFAULT 30, 
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, device_name) -- Prevent duplicate devices in same room
);

-- 3. WASTE EVENTS
-- The raw transactional data coming from your CV JSON
CREATE TABLE waste_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES device_catalog(device_id),
    
    -- When did the CV detect this?
    detection_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Raw data from JSON (parsed)
    duration_raw VARCHAR(20), -- Stores the original "05:00" for audit
    duration_interval INTERVAL NOT NULL, -- Converted for DB math
    duration_hours NUMERIC(10, 2) GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM duration_interval) / 3600
    ) STORED, -- Auto-calculated column for easy analytics
    
    -- Computed Metrics (Calculated at ingestion time)
    kwh_consumed NUMERIC(10, 4) NOT NULL,
    estimated_cost_php NUMERIC(10, 2) NOT NULL, -- Based on rate at time of capture
    
    -- CV Model Metadata
    confidence_score NUMERIC(5, 4), -- e.g., 0.98
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. INDEXING
-- Crucial for Time Series forecasting performance later
CREATE INDEX idx_waste_timestamp ON waste_events(detection_timestamp);
CREATE INDEX idx_device_lookup ON waste_events(device_id);

-- 5. ANALYTICS VIEW (The "Descriptive" Layer)
-- The LLM/MCP should query THIS view, not the raw tables, for summaries.
CREATE OR REPLACE VIEW daily_waste_analytics AS
SELECT 
    d.device_name,
    l.name as location,
    DATE(w.detection_timestamp) as event_date,
    COUNT(w.event_id) as total_incidents,
    SUM(w.duration_hours) as total_hours_wasted,
    SUM(w.kwh_consumed) as total_kwh,
    SUM(w.estimated_cost_php) as total_cost_php,
    
    -- Prescriptive Flag: Is this device behaving worse than allowed?
    CASE 
        WHEN AVG(EXTRACT(EPOCH FROM w.duration_interval)/60) > d.max_allowed_idle_minutes 
        THEN 'CRITICAL_VIOLATION'
        ELSE 'WITHIN_LIMITS'
    END as compliance_status
FROM 
    waste_events w
JOIN 
    device_catalog d ON w.device_id = d.device_id
JOIN 
    locations l ON d.location_id = l.location_id
GROUP BY 
    d.device_name, l.name, DATE(w.detection_timestamp), d.max_allowed_idle_minutes;