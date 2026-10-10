import { useState } from 'react'
import { Plus } from 'lucide-react'
import Navbar from '../components/Navbar'

const FEATURES = [
  ['Interactive skill tree', 'Zoom, pan, click. Structured nodes, not a boring checklist.'],
  ['Actionable nodes', 'Weekend project + GitHub repos + interview Qs per skill.'],
  ['Auto re-route', 'Mark already known and the tree re-plans instantly.'],
  ['Time-boxed', 'Set 10hrs/week, 6 months — AI fits the path to your life.'],
  ['People path', 'See intern to junior to dream intermediate roles behind each step.'],
  ['Track + share', 'Progress bar, unlocks, export PNG and share link.'],
]

function Accordion({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="space-y-2">
      {items.map(([t, d], i) => {
        const isOpen = open === i
        return (
          <div key={t} className={`rounded-2xl border transition ${isOpen ? 'border-white/25 bg-white/[0.06]' : 'border-white/10 bg-white/[0.03] hover:border-white/30/20'}`}>
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="font-semibold text-white">{t}</span>
              <span className={`shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center transition-transform ${isOpen ? 'rotate-45' : ''}`}>
                <Plus className="w-4 h-4 text-white" />
              </span>
            </button>
            {isOpen && <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{d}</p>}
          </div>
        )
      })}
    </div>
  )
}

export default function About() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-14">
        <h1 className="font-display text-4xl font-bold text-white">We kill generic career advice.</h1>
        <p className="text-gray-400 mt-4 leading-relaxed">
          Most advice to students is “learn React and build a portfolio.” The real journey to “Full Stack Dev at a climate startup”
          involves micro-credentials, intermediate roles, niche side projects and a timeline that fits your life. SkillVerse reverse-engineers that path.
        </p>

        <h2 className="font-display text-2xl font-bold text-white mt-10">How the AI works</h2>
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          {[
            ['Chain 1 — Planner', 'Goal → 4-6 phases → nodes (skill/role/project/cert) → edges. Strict JSON, realistic not generic.'],
            ['Chain 2 — Actionable', 'Node click → weekend project, 2 GitHub repos, resources, 5 interview Qs for THAT skill.'],
            ['Chain 3 — Re-planner', 'Known skills + hours/week + months → skip, re-chain deps, recalc hours.'],
          ].map(([t, d]) => (
            <div key={t} className="p-5 rounded-2xl glass"><div className="font-bold text-gray-300 text-sm">{t}</div><p className="text-sm text-gray-400 mt-2">{d}</p></div>
          ))}
        </div>

        <h2 className="font-display text-2xl font-bold text-white mt-10">Features</h2>
        <div className="mt-4">
          <Accordion items={FEATURES} />
        </div>

        <h2 className="font-display text-2xl font-bold text-white mt-10">Tech stack</h2>        <div className="flex flex-wrap gap-2 mt-3">
          {['ReactJS', 'Tailwind', 'React Flow', 'Framer Motion', 'FastAPI', 'LangChain', 'Axios'].map((t) => (
            <span key={t} className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-gray-200 border border-white/10">{t}</span>
          ))}
        </div>

        <h2 className="font-display text-2xl font-bold text-white mt-10">FAQ</h2>
        <div className="space-y-3 mt-4">
          {[
            ['Is the roadmap pre-written?', 'No. Every roadmap comes from the AI engine JSON for your exact input. Mock data only until backend is live.'],
            ['List vs skill tree?', 'Graph only. Zoom, pan, click nodes. Lists don’t count per requirements.'],
            ['What if I already know something?', 'Mark “already known” — the tree re-routes and skips dependents automatically.'],
            ['Can I compare two roles?', 'Yes — roadmap page has compare + overlap highlight (bonus).'],
          ].map(([q, a]) => (
            <div key={q} className="p-4 rounded-xl bg-white/5 border border-white/10"><div className="font-semibold text-white text-sm">{q}</div><div className="text-sm text-gray-400 mt-1">{a}</div></div>
          ))}
        </div>
      </div>
    </div>
  )
}
