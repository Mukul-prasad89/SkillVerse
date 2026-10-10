import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import logo from '../assets/logo.png'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const link = (to, label) => (
    <Link
      key={to}
      to={to}
      className={`px-3 py-2 rounded-lg text-sm transition ${
        loc.pathname === to ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  )
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="SkillVerse" className="h-9 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {link('/', 'Home')}
          {link('/about', 'About')}
          {link('/dashboard', 'Dashboard')}
          <a href="/#contact" className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Contact</a>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-200 transition">
            Generate Roadmap
          </Link>
        </div>
        <button className="md:hidden text-gray-300" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-2 border-t border-white/10 pt-3">
          {link('/', 'Home')}
          {link('/about', 'About')}
          {link('/dashboard', 'Dashboard')}
          <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold text-center">Generate Roadmap</Link>
        </div>
      )}
    </nav>
  )
}
