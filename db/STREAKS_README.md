# Streak System API Documentation

## Overview
The Streak System tracks user engagement and energy efficiency through a four-tier progression system integrated with a virtual pet companion.

## Database Schema

### Tables Created
1. **users** - Basic user information
2. **daily_usage** - Daily app interaction and energy metrics
3. **user_streaks** - Current streak status and tier
4. **pet_state** - Pet visual state linked to user tier
5. **tier_rewards** - Rewards for tier progression
6. **user_rewards** - User's earned rewards

### Tier System

| Tier | Color | Streak Days | Efficiency Required | Pet State |
|------|-------|-------------|---------------------|-----------|
| **Starter** | White (#FFFFFF) | 0-3 days | Any | Base form - idle |
| **Low Activity** | Orange (#FE8D00) | Any (missed 2+ days) | < 40% | Dull and sleeping |
| **Steady** | Yellow (#FFC94A) | 4-10 days | ≥ 50% | Lively and happy |
| **High Performer** | Blue (#245C94) | 11+ days | ≥ 60% | Fully evolved - glowing |

## API Endpoints (To Be Implemented)

### Get User Streak Data
```javascript
GET /api/streaks/:userId

Response:
{
  "currentStreak": 5,
  "bestStreak": 12,
  "currentTier": "Steady",
  "missedDays": 0,
  "avgEfficiency": 65.5,
  "weeklyGoalsMet": 6,
  "totalGoals": 7,
  "petState": {
    "name": "Spark",
    "tier": "Steady",
    "imageUrl": "/images/energy-pet-medium.png",
    "animationState": "happy"
  }
}
```

### Get Weekly Usage Data
```javascript
GET /api/usage/weekly/:userId

Response:
{
  "weeklyUsage": [
    { "day": "Monday", "usage": 80, "efficiency": 70 },
    { "day": "Tuesday", "usage": 90, "efficiency": 65 },
    { "day": "Wednesday", "usage": 120, "efficiency": 55 },
    { "day": "Thursday", "usage": 75, "efficiency": 75 },
    { "day": "Friday", "usage": 60, "efficiency": 80 },
    { "day": "Saturday", "usage": 110, "efficiency": 60 },
    { "day": "Sunday", "usage": 95, "efficiency": 68 }
  ]
}
```

### Record Daily Activity
```javascript
POST /api/usage/daily

Request Body:
{
  "userId": "uuid",
  "date": "2025-11-13",
  "dayOfWeek": "Wednesday",
  "usageMinutes": 120,
  "energyEfficiencyScore": 65.5
}

Response:
{
  "success": true,
  "streakUpdated": true,
  "newTier": "Steady",
  "tierChanged": false
}
```

## Database Functions

### calculate_user_tier(streak_days, avg_efficiency, missed_days)
Determines the appropriate tier based on user metrics.

### update_user_streak(user_id)
Automatically called when daily usage is recorded. Updates:
- Current streak count
- Best streak
- Current tier
- Pet state
- Missed days counter

## Tier Progression Rules

### Advancement
1. **Starter → Steady**: Maintain 4+ day streak with ≥50% efficiency
2. **Steady → High Performer**: Maintain 11+ day streak with ≥60% efficiency

### Demotion
1. Missing 2+ consecutive days → Drop one tier or reset to Low Activity
2. Efficiency drops below 40% → Low Activity
3. Streak resets when missing 2+ days

### Streak Mechanics
- **Daily Activity**: Each day of app use increases streak by 1
- **Same Day**: Multiple activities on same day don't increase streak
- **Missed Days**: 2+ days without activity resets streak to 1
- **Best Streak**: Highest streak ever achieved (never decreases)

## Pet Evolution System

### Visual States
- **Starter** (White): Small, inactive base form
- **Low Activity** (Orange): Dull, sleepy, less animated
- **Steady** (Yellow): Lively, growing, balanced
- **High Performer** (Blue): Glowing, fully evolved, animated

### Animation States
- `idle` - Basic standing animation (Starter)
- `sleeping` - Slow breathing, closed eyes (Low Activity)
- `happy` - Bouncing, playful movements (Steady)
- `glowing` - Pulsing glow effect, energetic (High Performer)

### Auto-Update Trigger
Pet state automatically updates when:
- Daily usage is recorded
- Streak tier changes
- User logs in after absence

## Rewards System

### Tier Rewards
Each tier unlock grants:
- Badge/Achievement
- Pet evolution
- Access to tier-specific features
- Points/Credits (future enhancement)

### Example Rewards
```sql
INSERT INTO tier_rewards (tier, reward_name, reward_description) VALUES
('Starter', 'Welcome Badge', 'Started your energy-saving journey!'),
('Steady', 'Consistent Saver', 'Maintaining good energy habits'),
('High Performer', 'Energy Champion', 'Master of energy efficiency!');
```

## Frontend Integration

### React Component Structure
```
streaks-modal.jsx
├── State Management
│   ├── streakData (from API)
│   ├── weeklyUsage (from API)
│   └── currentTier (calculated)
├── Tier Display
│   ├── Current streak with tier badge
│   ├── Progress to next tier
│   └── Best streak record
├── Weekly Chart
│   └── Bar chart from DailyUsage table
├── Pet Display
│   ├── Dynamic image based on tier
│   ├── Animation state
│   ├── Tier-colored background
│   └── Motivational messages
└── Tier System Overview
    └── All tiers with current highlight
```

### Data Flow
1. User opens Streak History modal
2. Component fetches data from API endpoints
3. `calculateTier()` determines current tier
4. Pet state loads based on tier
5. Weekly usage data populates chart
6. Progress bars show advancement status

## Implementation Checklist

### Database Setup
- [x] Create streaks_schema.sql
- [ ] Run schema on PostgreSQL database
- [ ] Verify table creation
- [ ] Insert default tier rewards
- [ ] Test database functions

### Backend API
- [ ] Create Express.js routes
- [ ] Implement GET /api/streaks/:userId
- [ ] Implement GET /api/usage/weekly/:userId
- [ ] Implement POST /api/usage/daily
- [ ] Add authentication middleware
- [ ] Test API endpoints

### Frontend
- [x] Update streaks-modal.jsx component
- [x] Implement tier calculation logic
- [x] Add pet animation states
- [x] Create weekly usage chart
- [ ] Connect to backend APIs
- [ ] Add loading states
- [ ] Implement error handling

### Assets
- [ ] Create/update pet images:
  - energy-pet-starter.png (white/gray)
  - energy-pet-bad.png (orange tint)
  - energy-pet-medium.png (yellow tint)
  - energy-pet-good.png (blue glow)
- [ ] Add animation sprites (optional)
- [ ] Create tier badge icons

## Testing Strategy

### Database Tests
- Test tier calculation with various scenarios
- Verify streak update trigger
- Test edge cases (same day, missed days)
- Validate tier progression/demotion

### API Tests
- Test all endpoints with valid data
- Test error handling
- Verify authentication
- Load testing for concurrent users

### Frontend Tests
- Test tier display accuracy
- Verify chart data rendering
- Test pet state transitions
- Validate responsive design

## Future Enhancements

1. **Multiplayer Features**
   - Leaderboards by tier
   - Friend comparisons
   - Team challenges

2. **Enhanced Rewards**
   - Cosmetic pet items
   - Custom themes
   - Premium features unlock

3. **Analytics**
   - Detailed efficiency breakdown
   - Month-over-month comparisons
   - Energy savings calculator

4. **Notifications**
   - Streak reminders
   - Tier promotion alerts
   - Daily goal notifications

5. **Social Features**
   - Share achievements
   - Pet showcase
   - Community challenges
