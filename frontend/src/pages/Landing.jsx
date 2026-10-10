import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, MousePointerClick, Route, Trophy, ArrowRight, Search, ListTodo, Network, Mail, Send, Globe, AtSign, MapPin } from 'lucide-react'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Background3D from '../components/Background3D'
import { ROLES } from '../lib/roles'

export default function Landing() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      {/* HERO + MARQUEE fill the first window */}
      <div className="min-h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden">
      <Background3D />
      <header className="max-w-3xl mx-auto px-4 pt-10 pb-10 flex flex-col items-center justify-center text-center flex-1 w-full relative z-10">
        <div className="flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold mb-5">
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
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center mb-4"><Icon className="w-5 h-5 text-white" /></div>
              <h3 className="font-display font-bold text-white">{t}</h3>
              <p className="text-sm text-gray-400 mt-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            ['Interactive skill tree', 'Zoom, pan, click. Structured nodes, not a boring checklist.'],
            ['Actionable nodes', 'Weekend project + GitHub repos + interview Qs per skill.'],
            ['Auto re-route', 'Mark already known and the tree re-plans instantly.'],
            ['Time-boxed', 'Set 10hrs/week, 6 months — AI fits the path to your life.'],
            ['People path', 'See intern to junior to dream intermediate roles behind each step.'],
            ['Track + share', 'Progress bar, unlocks, export PNG and share link.'],
          ].map(([t, d]) => (
            <div key={t} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/30 transition">
              <h3 className="font-semibold text-white">{t}</h3>
              <p className="text-sm text-gray-400 mt-1">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROLES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div><h2 className="font-display text-3xl font-bold text-white">Start from a real role</h2><p className="text-gray-500 mt-1 flex items-center gap-1.5"><Route className="w-4 h-4" /> Hyper-specific, not “web developer”.</p></div>
          <Link to="/dashboard" className="text-gray-300 text-sm font-semibold hidden sm:flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLES.filter((r) => r.id !== 'custom').slice(0, 6).map((r) => (
            <Link key={r.id} to={`/dashboard?role=${r.id}`} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition">
              <div className="font-display font-bold text-white text-lg">{r.icon}</div>
              <div className="font-bold text-white mt-2">{r.title}</div>
              <div className="text-xs text-gray-300">{r.company}</div>
              <div className="text-xs text-gray-400 mt-2">{r.description}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* PAIN vs SOLUTION */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="rounded-3xl p-8 md:p-12 bg-white/[0.04] border border-white/10 grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 text-gray-300 text-sm font-semibold mb-3"><ListTodo className="w-4 h-4" /> The old way</div>
            <p className="text-gray-400 text-sm leading-relaxed">“Learn React and build a portfolio.” No roles. No certs. No timeline. No idea what comes after Todo-app #37.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-white text-sm font-semibold mb-3"><Trophy className="w-4 h-4" /> The SkillVerse way</div>
            <p className="text-gray-200 text-sm leading-relaxed">Intern → Freelance → Jr → Dream. Each node has hours, a weekend project, repos to read, and interview Qs. Mark known → tree re-routes.</p>
            <Link to="/dashboard" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200">Try it now <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>
      {/* CONTACT */}
      <section id="contact" className="max-w-7xl mx-auto px-4 pb-16">
        <div className="rounded-3xl glass p-8 md:p-10 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">Contact us</h2>
            <p className="text-gray-400 mt-2 text-sm">Questions, feedback, college / hackathon collab — we reply within 24hrs.</p>
            <div className="space-y-3 mt-6 text-sm">
              <a href="mailto:hello@skillverse.ai" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-gray-200"><Mail className="w-4 h-4 text-gray-300" /> hello@skillverse.ai</a>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-200"><MapPin className="w-4 h-4 text-gray-400" /> India • Remote friendly</div>
              <div className="flex gap-2">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-gray-200"><Globe className="w-4 h-4" /> GitHub</a>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-gray-200"><AtSign className="w-4 h-4" /> Twitter</a>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
        <footer className="text-center text-xs text-gray-600 mt-10">SkillVerse • Built with React + FastAPI + LangChain • Hackathon demo (mock AI until backend live)</footer>
      </section>
    </div>
  )
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return alert('Fill all fields')
    try {
      const inbox = JSON.parse(localStorage.getItem('contact-inbox') || '[]')
      localStorage.setItem('contact-inbox', JSON.stringify([{ ...form, at: Date.now() }, ...inbox].slice(0, 20)))
    } catch {}
    setSent(true)
    setForm({ name: '', email: '', message: '' })
    setTimeout(() => setSent(false), 4000)
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-white/40 placeholder:text-gray-600" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="Email address" className="px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-white/40 placeholder:text-gray-600" />
      </div>
      <input placeholder="Subject (optional)" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-white/40 placeholder:text-gray-600" />
      <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Tell us: your dream role, college, or feedback..." className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-white/40 placeholder:text-gray-600 resize-none" />
      <button type="submit" className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 glow-violet">
        <Send className="w-4 h-4" /> {sent ? 'Message sent — we will reply soon!' : 'Send message'}
      </button>
      {sent && <p className="text-xs text-white text-center">Saved locally + ready to wire to FastAPI /api/contact</p>}
    </form>
  )
}
