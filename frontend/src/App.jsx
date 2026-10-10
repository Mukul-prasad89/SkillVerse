import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RoadmapProvider } from './lib/RoadmapContext'
import Landing from './pages/Landing'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import Roadmap from './pages/Roadmap'

export default function App() {
  return (
    <RoadmapProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/roadmap/:id" element={<Roadmap />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </RoadmapProvider>
  )
}
