import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { RoadmapProvider } from './lib/RoadmapContext'
import PageTransition from './components/PageTransition'
import Landing from './pages/Landing'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import Roadmap from './pages/Roadmap'
import Contact from './pages/Contact'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/roadmap/:id" element={<PageTransition><Roadmap /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <RoadmapProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </RoadmapProvider>
  )
}
