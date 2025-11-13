# VoltGuard ⚡

<div align="center">

![VoltGuard Logo](./client/public/voltguard-logo.png)

**Smart Energy Monitoring & Waste Detection System**

A real-time energy monitoring platform that uses computer vision and AI to detect energy waste, track consumption patterns, and gamify energy-saving behaviors.

[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.121-green.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Configuration](#-configuration)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

VoltGuard is an intelligent energy monitoring system that combines computer vision, IoT, and gamification to help users reduce energy consumption and costs. The platform uses YOLOv8 for real-time device detection, tracks energy usage patterns, and provides actionable insights through an intuitive mobile-first interface.

### Key Capabilities

- **Real-time Device Detection**: CV-powered monitoring of electrical devices
- **Energy Waste Tracking**: Identifies idle devices and calculates wasted kWh
- **Smart Notifications**: Real-time alerts via Socket.IO for high usage and anomalies
- **Gamification**: Streak system with evolving energy pets to encourage consistent engagement
- **Analytics Dashboard**: Comprehensive insights into energy consumption patterns
- **AI Chatbot**: OpenAI-powered assistant for energy-saving recommendations

---

## ✨ Features

### 🎥 Camera System
- Multi-camera support with YOLOv8 object detection
- Real-time video streaming with base64 encoding
- Device state monitoring (ON/OFF detection)
- Configurable detection confidence thresholds

### 📊 Dashboard
- Mobile-responsive design (optimized for 390x844)
- Live energy usage metrics
- Alert ping notifications with expandable logs
- Weekly activity visualization
- Analytics with month-over-month comparisons

### 🔥 Gamification
- **4-Tier Streak System**:
  - **Starter**: New users (0 days, gray)
  - **Low Activity**: < 4 days or high usage (orange)
  - **Steady**: 4-10 days with good usage (yellow)
  - **High Performer**: 11+ days with efficient consumption (blue)
- Evolving energy pets with animated states
- Reward system for maintaining streaks
- Weekly usage graphs with tooltips

### 🔔 Notifications
- Real-time push notifications via Socket.IO
- iPhone-style banner alerts
- Severity-based color coding (error, warning, info)
- Notification history and logs
- Redis-backed pub/sub system

### 🤖 AI Chatbot
- OpenAI GPT-powered energy advisor
- Context-aware recommendations
- Natural language query support
- Integration with usage data

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │ Camera   │  │ Chatbot  │  │Modals    │   │
│  │          │  │ System   │  │          │  │          │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │          │
│       └─────────────┴──────────────┴─────────────┘          │
│                        │                                     │
│                   Socket.IO / HTTP                           │
└───────────────────────┼─────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────┐
│                   BACKEND (FastAPI)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ MCP Server  │  │ Video API    │  │ Socket.IO    │       │
│  │ (Tools)     │  │ (YOLOv8)     │  │ Server       │       │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                │                  │                │
│         └────────────────┴──────────────────┘                │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │PostgreSQL│     │  Redis   │     │  Ollama  │
   │ (Data)   │     │ (Cache)  │     │  (LLM)   │
   └──────────┘     └──────────┘     └──────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2 with Vite
- **UI Library**: Radix UI + Tailwind CSS
- **Routing**: React Router v7
- **Real-time**: Socket.IO Client
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Tailwind Animate

### Backend
- **API Framework**: FastAPI 0.121
- **MCP Server**: FastMCP (Model Context Protocol)
- **Real-time**: Socket.IO (Python)
- **Computer Vision**: YOLOv8 (OpenCV + PyTorch)
- **Database**: PostgreSQL 17
- **Cache**: Redis 7
- **LLM**: Ollama (llama3.2)
- **AI API**: OpenAI GPT

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database GUI**: RedisInsight
- **Web Server**: Uvicorn (ASGI)

---

## 🚀 Getting Started

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js** 18+ (for local development)
- **Python** 3.11+ (for local development)
- **OpenAI API Key** (for chatbot feature)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VladTemp27/voltguard.git
   cd voltguard
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file in root
   cp .env.example .env
   
   # Edit .env with your configuration
   PG_USER=voltguard_user
   PG_PASSWORD=securepassword
   PG_DATABASE=voltguard_db
   REDIS_PASSWORD=securepassword
   OPENAI_API_KEY=your_openai_key
   ```

3. **Start the application with Docker**
   ```bash
   docker compose up --build
   ```

4. **Access the services**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8000
   - **RedisInsight**: http://localhost:8001
   - **Ollama API**: http://localhost:11434
   - **PostgreSQL**: localhost:5432

### Local Development (Without Docker)

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

#### Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 📁 Project Structure

```
voltguard/
├── backend/                    # Python backend
│   ├── main.py                # FastAPI + MCP server entry point
│   ├── video_api.py           # Video streaming endpoints
│   ├── energy_server.py       # Energy monitoring logic
│   ├── test_notifications.py  # Notification testing
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile
│   └── model/                 # Computer vision models
│       ├── detection.py       # YOLOv8 detection logic
│       ├── energy_logger.py   # Energy calculation
│       ├── best_max.pt        # Trained model weights
│       └── weights_volt.pt
│
├── client/                     # React frontend
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   ├── components/        # Reusable components
│   │   │   ├── dashboard-content.jsx
│   │   │   ├── camera-system.jsx
│   │   │   ├── chatbot.jsx
│   │   │   ├── NotificationListener.jsx
│   │   │   ├── sidebar-nav.jsx
│   │   │   ├── top-nav.jsx
│   │   │   ├── video-feed.jsx
│   │   │   ├── modals/        # Modal dialogs
│   │   │   │   ├── alerts-modal.jsx
│   │   │   │   ├── analytics-modal.jsx
│   │   │   │   ├── camera-system-modal.jsx
│   │   │   │   ├── game-modal.jsx
│   │   │   │   └── streaks-modal.jsx
│   │   │   └── ui/            # Radix UI wrappers
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Game.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── System.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   └── styles/            # Global styles
│   ├── public/
│   │   └── images/            # Pet evolution images
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── db/                         # Database schemas
│   ├── schema.sql             # PostgreSQL schema
│   ├── generator.py           # Mock data generator
│   └── README.md
│
├── docker-compose.yaml         # Docker orchestration
├── package.json               # Root dependencies
└── README.md                  # This file
```

---

## 📡 API Documentation

### REST Endpoints

#### Energy Monitoring
```http
GET /api/energy/summary?start_date=2024-01-01&end_date=2024-01-31
```
Returns energy consumption summary by location.

#### Video Streaming
```http
GET /api/video/feed/{camera_id}
```
Returns base64-encoded video frames with detection overlays.

#### MCP Tools
```http
POST /mcp/tools/get_waste_summary_by_location
```
MCP tool for querying waste events.

### Socket.IO Events

#### Client → Server
- `connect`: Establish connection
- `disconnect`: Close connection

#### Server → Client
- `notification`: Real-time alerts
  ```json
  {
    "id": "uuid",
    "message": "High Usage Detected",
    "device": "Camera 3",
    "timestamp": "2024-01-15T14:30:00Z",
    "level": "error"
  }
  ```

---

## 🗄️ Database Schema

### Core Tables

#### `locations`
Stores camera/monitoring locations.
```sql
location_id UUID PRIMARY KEY
name VARCHAR(100)
description TEXT
created_at TIMESTAMP
```

#### `device_catalog`
Device specifications and thresholds.
```sql
device_id UUID PRIMARY KEY
location_id UUID REFERENCES locations
device_name VARCHAR(50)
avg_wattage_rating INTEGER
standby_wattage_rating INTEGER
max_allowed_idle_minutes INTEGER
```

#### `waste_events`
Raw detection events from CV system.
```sql
event_id UUID PRIMARY KEY
device_id UUID REFERENCES device_catalog
detection_timestamp TIMESTAMP
duration_interval INTERVAL
kwh_consumed NUMERIC(10,4)
estimated_cost_php NUMERIC(10,2)
confidence_score NUMERIC(5,4)
```

### Analytics View
```sql
CREATE VIEW daily_waste_analytics AS
-- Aggregates daily metrics with compliance status
```

See `db/schema.sql` for complete schema.

---

## ⚙️ Configuration

### Environment Variables

```bash
# Database
PG_USER=voltguard_user
PG_PASSWORD=securepassword
PG_DATABASE=voltguard_db
PG_HOST=localhost
PG_PORT=5432

# Redis
REDIS_PASSWORD=securepassword
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI
OPENAI_API_KEY=sk-...

# Server
PORT=8000
HOST=0.0.0.0
```

### Client Configuration

Edit `client/vite.config.js` for proxy settings:
```javascript
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
}
```

---

## 🧪 Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd client
npm test
```

### Code Quality

```bash
# Frontend linting
cd client
npm run lint

# Backend formatting
cd backend
black .
flake8
```

### Database Migrations

```bash
# Generate mock data
cd db
python generator.py

# Reset database
docker compose down -v
docker compose up -d postgres
```

---

## 🎨 Design System

### Color Palette
- **Primary**: `#FE8D00` (Orange)
- **Secondary**: `#245C94` (Blue)
- **Success**: `#FFC94A` (Yellow)
- **Error**: `#EF4444` (Red)
- **Background**: `#FFF8F0` (Cream)

### Tier Colors
- **Starter**: `#FFFFFF` (Gray)
- **Low Activity**: `#FE8D00` (Orange)
- **Steady**: `#FFC94A` (Yellow)
- **High Performer**: `#245C94` (Blue)

### Responsive Breakpoints
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 👥 Team

**VoltGuard Development Team**

- **Luis, Marven Joffre**
- **Agustin, Mark Lestat**
- **Morados, Lou Diamong**
- **Caparas, Maxine Van**
- **Pelobello, Fernan Frans**

Repository: [github.com/VladTemp27/voltguard](https://github.com/VladTemp27/voltguard)

---

## 🙏 Acknowledgments

- [YOLOv8](https://github.com/ultralytics/ultralytics) for object detection
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [FastAPI](https://fastapi.tiangolo.com/) for backend framework
- [Socket.IO](https://socket.io/) for real-time communication

---

<div align="center">

**Made with ⚡ by the VoltGuard Team**

[Report Bug](https://github.com/VladTemp27/voltguard/issues) · [Request Feature](https://github.com/VladTemp27/voltguard/issues)

</div>
