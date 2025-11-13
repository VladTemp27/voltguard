import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Game from './pages/Game'
import Settings from './pages/Settings'
import System from './pages/System'
import './styles/globals.css'
import VideoFeed from './components/video-feed'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/game" element={<Game />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/system" element={<System />} />
        <Route path="/test-video" element={<VideoFeed />} />
      </Routes>
    </Router>
  )
}

export default App
