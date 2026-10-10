import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, MousePointerClick, ArrowRight, Search, Network, Mail, Globe, AtSign, MapPin } from 'lucide-react'
import Navbar from '../components/Navbar'
import Background3D from '../components/Background3D'
import ContactForm from '../components/ContactForm'

export default function Landing() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      {/* HERO + MARQUEE fill the first window */}
      <div className="min-h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden">
      <Background3D />
      <header className="max-w-3xl mx-auto px-4 pt-10 pb-10 flex flex-col items-center justify-center text-center flex-1 w-full relative z-10">
        <div className="flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" /> AI reverse-engineers real career paths
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.05]">
            Don't guess your career. <span className="text-white">Reverse-engineer it.</span>
          </motion.h1>
          <p className="text-gray-400 mt-5 text-base md:text-lg max-w-xl">
            Type “Full Stack Dev at a climate startup”. Get a playable skill-tree with real roles, certs and projects — not “learn React lol”.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <Link to="/dashboard" className="px-6 py-3 rounded-xl bg-white text-black font-semibold flex items-center gap-2 hover:bg-gray-200">
              Generate My Roadmap <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/dashboard" className="px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-semibold hover:bg-white/15">See sample tree</Link>
          </div>
        </div>
      </header>

      {/* MARQUEE */}
      <div className="border-y border-white/10 bg-white/[0.02] py-3 overflow-hidden">
        <div className="marquee-track text-sm text-gray-400 font-medium">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-3 pr-3">
              {['Frontend @ SaaS', 'Climate Full Stack', 'Fintech UX', 'HealthTech ML', 'Sports Analytics', 'DevOps Fintech', 'EdTech Mobile', 'AI Product'].map((t) => (
                <span key={t + k} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 whitespace-nowrap">✦ {t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-white text-center">How it works</h2>
        <p className="text-gray-500 text-center mt-2">Three steps. Zero generic advice.</p>
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {[
            { Icon: Search, t: '1. Enter dream job', d: 'Hyper-specific: role + company type + hours/week + timeline.' },
            { Icon: Network, t: '2. AI builds skill tree', d: 'LangChain chains generate phases, skills, roles, certs as JSON graph.' },
            { Icon: MousePointerClick, t: '3. Click, learn, unlock', d: 'Click any node for projects, repos, interview Qs. Complete to unlock.' },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="p-6 rounded-2xl glass">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-4"><Icon className="w-5 h-5 text-white" /></div>
              <h3 className="font-display font-bold text-white">{t}</h3>
              <p className="text-sm text-gray-400 mt-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-7xl mx-auto px-4" aria-hidden="true">
        <div className="h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>

      {/* CONTACT */}
      <section id="contact" className="max-w-7xl mx-auto px-4 pb-16">
        <div className="rounded-3xl glass p-8 md:p-10 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">Contact us</h2>
            <p className="text-gray-400 mt-2 text-sm">Questions, feedback, college / hackathon collab — we reply within 24hrs.</p>
            <div className="space-y-3 mt-6 text-sm">
              <a href="mailto:mukulprasad89@gmail.com" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-gray-200"><Mail className="w-4 h-4 text-gray-300" /> <span><span className="text-gray-500 text-xs block">Email 1</span>mukulprasad89@gmail.com</span></a>
              <a href="mailto:kunaldubey1810@gmail.com" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-gray-200"><Mail className="w-4 h-4 text-gray-300" /> <span><span className="text-gray-500 text-xs block">Email 2</span>kunaldubey1810@gmail.com</span></a>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-200"><MapPin className="w-4 h-4 text-gray-400" /> India • Remote friendly</div>
              <div className="flex gap-2">
                <a href="https://github.com/Mukul-prasad89" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-gray-200"><Globe className="w-4 h-4" /> GitHub 1</a>
                <a href="https://github.com/kunaldubey10" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-gray-200"><Globe className="w-4 h-4" /> GitHub 2</a>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-gray-200"><AtSign className="w-4 h-4" /> Twitter</a>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
          <div>
            <div className="font-display font-bold text-white text-lg">SkillVerse</div>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">Reverse-engineer your dream job into a personalized, interactive skill tree.</p>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-white mb-3">Product</div>
            <div className="flex flex-col gap-2 text-gray-400">
              <Link to="/" className="hover:text-white transition w-fit">Home</Link>
              <Link to="/about" className="hover:text-white transition w-fit">About</Link>
              <Link to="/dashboard" className="hover:text-white transition w-fit">Dashboard</Link>
            </div>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-white mb-3">Contact</div>
            <div className="flex flex-col gap-2 text-gray-400">
              <a href="mailto:mukulprasad89@gmail.com" className="hover:text-white transition w-fit">mukulprasad89@gmail.com</a>
              <a href="mailto:kunaldubey1810@gmail.com" className="hover:text-white transition w-fit">kunaldubey1810@gmail.com</a>
              <a href="https://github.com/Mukul-prasad89" target="_blank" rel="noreferrer" className="hover:text-white transition w-fit">GitHub 1</a>
              <a href="https://github.com/kunaldubey10" target="_blank" rel="noreferrer" className="hover:text-white transition w-fit">GitHub 2</a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-white transition w-fit">Twitter</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-gray-600">SkillVerse • Built with React + FastAPI + LangChain</div>
        </div>
      </footer>
    </div>
  )
}
