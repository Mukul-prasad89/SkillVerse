import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Loader2, Wand2, Clock } from 'lucide-react'
import api, { generateRoadmap } from '../lib/api'
import { useCountdown } from '../lib/useCountdown'

export default function RoleIntakeModal({ role, open, onClose, onParsed }) {
  const [bgText, setBgText] = useState('')
  const [hours, setHours] = useState(10)
  const [months, setMonths] = useState(6)
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState(null)
  const [generating, setGenerating] = useState(false)
  const { seconds: countdown, start: startCountdown, stop: stopCountdown } = useCountdown()

  if (!role) return null

  const parse = async () => {
    if (!bgText.trim()) return alert('Tell us what you have learned so far')
    setParsing(true)
    try {
      const { data } = await api.post('/api/profile/parse', {
        goal: `${role.title} at ${role.company}`,
        background_text: bgText,
      })
      setParsed(data)
    } catch (e) {
      // fallback: local keyword extract so UI never blocks
      setParsed(localParse(bgText))
    } finally {
      setParsing(false)
    }
  }

  const generate = async () => {
    setGenerating(true)
    startCountdown(17)
    try {
      // Shared helper tries AI pipeline (/api/roadmaps/generate) -> legacy -> mock
      const payload = {
        goal: `${role.title} at ${role.company}`,
        background_text: bgText,
        hours_per_week: hours,
        timeline_months: months,
        known_skills: parsed?.known_skills || [],
        level: parsed?.level || 'Student',
      }
      const data = await generateRoadmap(payload)
      onParsed(data, payload)
    } finally {
      stopCountdown()
      setGenerating(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0a0a0a] border border-white/10 p-6 md:p-8 glow-violet"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-display font-bold text-white text-xl leading-tight">{role.title}</h2>
                  <p className="text-xs text-gray-300 font-medium">{role.company} • ~{role.months}mo • {role.difficulty}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-white/[0.06] border border-white/10">
              <div className="text-sm font-bold text-white">Tell us in your own words</div>
              <p className="text-xs text-gray-400 mt-1">
                e.g. “I know HTML, CSS, a bit of JS. Built a portfolio + todo app. No backend yet.” — AI extracts skills, projects & level.
              </p>
            </div>

            <textarea
              value={bgText}
              onChange={(e) => setBgText(e.target.value)}
              rows={5}
              placeholder="I have learned HTML, CSS and basic JavaScript. I built a personal portfolio and a weather app with an API. I haven't done React or backend yet..."
              className="mt-3 w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-white/40 placeholder:text-gray-600 resize-none leading-relaxed"
            />

            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/10">
                <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> HOURS/WEEK: <span className="text-gray-300">{hours}h</span></div>
                <input type="range" min={2} max={40} value={hours} onChange={(e) => setHours(+e.target.value)} className="w-full mt-2 accent-white" />
              </div>
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/10">
                <div className="text-xs font-semibold text-gray-400">TIMELINE</div>
                <div className="flex gap-1.5 mt-2">
                  {[3, 6, 9, 12].map((m) => (
                    <button key={m} onClick={() => setMonths(m)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${months === m ? 'bg-white text-black' : 'bg-white/10 text-gray-300'}`}>{m}mo</button>
                  ))}
                </div>
              </div>
            </div>

            {!parsed ? (
              <button onClick={parse} disabled={parsing} className="mt-4 w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {parsing ? <><Loader2 className="w-4 h-4 animate-spin" /> AI reading your background...</> : <><Wand2 className="w-4 h-4" /> Analyze my background</>}
              </button>
            ) : (
              <div className="mt-4 p-4 rounded-2xl bg-white/[0.06] border border-white/10">
                <div className="text-xs font-bold text-white uppercase tracking-wider">AI understood you</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(parsed.known_skills || []).map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">{s}</span>
                  ))}
                  {(parsed.known_skills || []).length === 0 && <span className="text-xs text-gray-400">No strong skills detected — starting from foundations.</span>}
                </div>
                {parsed.projects?.length > 0 && <p className="text-xs text-gray-300 mt-2">Projects: {parsed.projects.join(', ')}</p>}
                {parsed.summary && <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{parsed.summary}</p>}
                <div className="text-[11px] text-gray-500 mt-2">Level: {parsed.level} • Timeline fit: {parsed.timeline_fit || `${months} months @ ${hours}h/wk`}</div>
                <button onClick={() => setParsed(null)} className="text-[11px] text-gray-300 underline mt-1">Edit background & re-analyze</button>
              </div>
            )}

            <button onClick={generate} disabled={generating || !bgText.trim()} className="mt-3 w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 glow-violet">
              {generating ? <><Loader2 className="w-5 h-5 animate-spin" /> Building your skill tree... <span className="text-green-600 font-mono font-bold">{countdown !== null ? `${countdown}s` : ''}</span></> : <><Sparkles className="w-5 h-5" /> Generate My Structured Roadmap</>}
            </button>
            <p className="text-[11px] text-gray-600 text-center mt-2">Background text → LLM keyword extraction → personalized timeline</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function localParse(text) {
  const SKILLS = ['html', 'css', 'javascript', 'js', 'typescript', 'react', 'node', 'python', 'sql', 'figma', 'tailwind', 'next.js', 'express', 'postgres', 'mongodb', 'git', 'docker', 'aws', 'flutter', 'dart', 'pytorch', 'pandas', 'tableau', 'dbt', 'kubernetes', 'terraform', 'unity', 'c#', 'java', 'firebase']
  const low = text.toLowerCase()
  const known_skills = SKILLS.filter((s) => low.includes(s)).map((s) => (s === 'js' ? 'JavaScript' : s))
  const projects = []
  if (/portfolio|website|landing/.test(low)) projects.push('Portfolio website')
  if (/todo/.test(low)) projects.push('Todo app')
  if (/weather|api/.test(low)) projects.push('API-based app')
  if (/clone|e-?commerce|dashboard/.test(low)) projects.push('Dashboard/clone project')
  return { known_skills: [...new Set(known_skills)], projects, level: known_skills.length >= 5 ? 'Fresher' : 'Student', summary: `Detected ${known_skills.length} skills and ${projects.length} project signals from your text. Roadmap will skip foundations you know.`, timeline_fit: 'auto-fit to your hours' }
}
