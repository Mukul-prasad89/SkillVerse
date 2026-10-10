import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Loader2, Sparkles, Plus, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import RoleCard from '../components/RoleCard'
import RoleIntakeModal from '../components/RoleIntakeModal'
import { ROLES } from '../lib/roles'
import { useRoadmap } from '../lib/RoadmapContext'
import { generateRoadmap } from '../lib/api'

export default function Dashboard() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const { state, dispatch } = useRoadmap()
  const [query, setQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState(params.get('role') || '')
  const [goal, setGoal] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [modalRole, setModalRole] = useState(null)

  const openIntake = (r) => {
    setSelectedRole(r.id)
    if (r.id !== 'custom' && !goal) setGoal(`${r.title} at ${r.company}`)
    if (r.id === 'custom') {
      document.getElementById('custom-panel')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    setModalRole(r)
  }

  const handleModalParsed = (data, payload) => {
    dispatch({ type: 'SET_FORM', payload: { goal: payload.goal, hours: payload.hours_per_week, months: payload.timeline_months, known: payload.known_skills, level: payload.level || state.level } })
    dispatch({ type: 'SET_ROADMAP', payload: data })
    setModalRole(null)
    try {
      const recents = JSON.parse(localStorage.getItem('recent') || '[]')
      localStorage.setItem('recent', JSON.stringify([{ goal: payload.goal, at: Date.now() }, ...recents].slice(0, 6)))
    } catch {}
    nav('/roadmap/latest')
  }

  useEffect(() => {
    const r = ROLES.find((x) => x.id === selectedRole)
    if (r && r.id !== 'custom' && !goal) setGoal(`${r.title} at ${r.company}`)
  }, [selectedRole])

  const filtered = useMemo(
    () => ROLES.filter((r) => (r.title + r.company + r.skills.join(' ')).toLowerCase().includes(query.toLowerCase())),
    [query]
  )

  const addSkill = () => {
    const v = skillInput.trim()
    if (!v) return
    if (!state.known.includes(v)) dispatch({ type: 'SET_FORM', payload: { known: [...state.known, v] } })
    setSkillInput('')
  }

  const generate = async () => {
    if (!goal.trim()) return alert('Type your dream job first')
    dispatch({ type: 'SET_LOADING', payload: true })
    const payload = { goal, hours_per_week: state.hours, timeline_months: state.months, known_skills: state.known, level: state.level }
    const data = await generateRoadmap(payload)
    dispatch({ type: 'SET_FORM', payload: { goal } })
    dispatch({ type: 'SET_ROADMAP', payload: data })
    try {
      const recents = JSON.parse(localStorage.getItem('recent') || '[]')
      localStorage.setItem('recent', JSON.stringify([{ goal, at: Date.now() }, ...recents].slice(0, 6)))
    } catch {}
    dispatch({ type: 'SET_LOADING', payload: false })
    nav('/roadmap/latest')
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Choose your destination</h1>
        <p className="text-gray-500 mt-2">Click a card → tell us in plain English what you’ve learned so far → AI extracts skills & builds your timeline.</p>

        <div className="relative mt-6 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search roles: fintech, ml, mobile..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/40 placeholder:text-gray-600" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {filtered.map((r) => (
            <RoleCard key={r.id} role={r} selected={selectedRole === r.id} onSelect={() => openIntake(r)} />
          ))}
        </div>

        <RoleIntakeModal role={modalRole} open={!!modalRole} onClose={() => setModalRole(null)} onParsed={handleModalParsed} />

        {/* INPUT PANEL */}
        <div id="custom-panel" className="mt-8 rounded-3xl glass p-6 md:p-8 glow-violet">
          <div className="flex items-center gap-2 text-white text-sm font-bold mb-4"><Sparkles className="w-4 h-4" /> CUSTOMIZE + GENERATE</div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dream job (be hyper-specific)</label>
          <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder='e.g. Full Stack Developer at a climate tech startup' className="mt-2 w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-white/40 placeholder:text-gray-600" />

          <div className="grid md:grid-cols-3 gap-4 mt-5">
            <div className="p-4 rounded-xl bg-black/30 border border-white/10">
              <div className="text-xs font-semibold text-gray-400">HOURS / WEEK: <span className="text-white">{state.hours}h</span></div>
              <input type="range" min={2} max={40} value={state.hours} onChange={(e) => dispatch({ type: 'SET_FORM', payload: { hours: +e.target.value } })} className="w-full mt-3 accent-white" />
            </div>
            <div className="p-4 rounded-xl bg-black/30 border border-white/10">
              <div className="text-xs font-semibold text-gray-400">TIMELINE</div>
              <div className="flex gap-2 mt-3">
                {[3, 6, 9, 12].map((m) => (
                  <button key={m} onClick={() => dispatch({ type: 'SET_FORM', payload: { months: m } })} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${state.months === m ? 'bg-white text-black' : 'bg-white/10 text-gray-300'}`}>{m}mo</button>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-black/30 border border-white/10">
              <div className="text-xs font-semibold text-gray-400">CURRENT LEVEL</div>
              <div className="flex gap-2 mt-3">
                {['Student', 'Fresher', '1yr+'].map((l) => (
                  <button key={l} onClick={() => dispatch({ type: 'SET_FORM', payload: { level: l } })} className={`flex-1 py-2 rounded-lg text-xs font-semibold ${state.level === l ? 'bg-white text-black' : 'bg-white/10 text-gray-300'}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skills you already know</div>
            <div className="flex gap-2 mt-2">
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkill()} placeholder="e.g. HTML, JavaScript — press Enter" className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-white/40 placeholder:text-gray-600" />
              <button onClick={addSkill} className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {state.known.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium">
                  {s}<button onClick={() => dispatch({ type: 'SET_FORM', payload: { known: state.known.filter((x) => x !== s) } })}><X className="w-3 h-3" /></button>
                </span>
              ))}
              {state.known.length === 0 && <span className="text-xs text-gray-600">None yet — tree will include foundations.</span>}
            </div>
          </div>

          <button onClick={generate} disabled={state.loading} className="mt-6 w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 glow-violet">
            {state.loading ? <><Loader2 className="w-5 h-5 animate-spin" /> AI is building your skill tree...</> : <><Sparkles className="w-5 h-5" /> Generate My Skill Tree →</>}
          </button>
          <p className="text-[11px] text-gray-600 text-center mt-3">Uses FastAPI + LangChain when backend live · mock AI for demo otherwise</p>
        </div>
      </div>
    </div>
  )
}
