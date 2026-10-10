import { useState } from 'react'
import { X, ExternalLink, Check, EyeOff, GitBranch, BookOpen, HelpCircle, Users } from 'lucide-react'
import { fetchNodeDetail } from '../lib/api'
import { useEffect } from 'react'

export default function DetailPanel({ node, goal, onClose, onComplete, onKnown, completed }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!node) return
    setLoading(true)
    setDetail(null)
    fetchNodeDetail({ node_id: node.id, goal, label: node.label })
      .then(setDetail)
      .finally(() => setLoading(false))
  }, [node?.id])

  if (!node) return null
  const isDone = completed.includes(node.id)
  const ai = node._detail || null  // real AI fields from the pipeline JSON (not mock)

  return (
    <div className="absolute right-0 top-0 h-full w-full sm:w-[380px] z-20 p-3">
      <div className="h-full rounded-2xl bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 p-5 overflow-y-auto">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-gray-300 font-bold">{node.type}</div>
            <h3 className="font-display font-bold text-white text-lg leading-tight mt-1">{node.label}</h3>
            <p className="text-sm text-gray-400 mt-2">{node.description}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={() => onComplete(node.id)} className={`flex-1 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ${isDone ? 'bg-white/10 text-white' : 'bg-white text-black hover:bg-gray-200'}`}>
            <Check className="w-4 h-4" />{isDone ? 'Completed' : 'Mark Complete'}
          </button>
          <button onClick={() => onKnown(node.id, node.label)} className="flex-1 py-2 rounded-xl text-sm font-semibold bg-white/10 text-white hover:bg-white/15 flex items-center justify-center gap-1.5">
            <EyeOff className="w-4 h-4" />Already known
          </button>
        </div>

        {loading && <div className="mt-6 space-y-3 animate-pulse"><div className="h-20 bg-white/10 rounded-xl" /><div className="h-24 bg-white/10 rounded-xl" /><div className="h-24 bg-white/10 rounded-xl" /></div>}

        {ai && (
          <div className="mt-5 p-4 rounded-xl bg-white/[0.05] border border-white/10 text-sm space-y-2.5">
            <div className="text-[11px] uppercase tracking-wider text-gray-300 font-bold">AI plan for this step</div>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {ai.start_week && <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-200">W{ai.start_week}–{ai.end_week} • {ai.estimated_hours}h</span>}
              {ai.priority && <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-200 capitalize">{ai.priority} priority</span>}
              {ai.current_proficiency && <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-200">{ai.current_proficiency} → {ai.target_proficiency}</span>}
            </div>
            {ai.career_relevance && <p className="text-gray-300 text-[13px]"><span className="font-semibold text-white">Why it matters: </span>{ai.career_relevance}</p>}
            {ai.completion_criteria?.length > 0 && (
              <div><div className="font-semibold text-white text-[13px] mb-1">Done when:</div>
              <ul className="list-disc ml-4 space-y-1 text-gray-300 text-[13px]">{ai.completion_criteria.map((c) => <li key={c}>{c}</li>)}</ul></div>
            )}
            {ai.verification_method && <p className="text-gray-400 text-xs">Verify: {ai.verification_method}</p>}
            {ai.recommended_project && <p className="text-gray-300 text-[13px]">Project: {ai.recommended_project}</p>}
            {ai.recommended_credentials?.length > 0 && <p className="text-gray-200 text-[13px]">{ai.recommended_credentials.join(', ')}</p>}
            {ai.prerequisites?.length > 0 && <p className="text-gray-500 text-xs">Needs first: {ai.prerequisites.join(', ')}</p>}
          </div>
        )}

        {detail && (
          <div className="mt-5 space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-white/[0.06] border border-white/10">
              <div className="font-bold text-white mb-1">Weekend Project</div>
              <p className="text-gray-300">{detail.weekend_project}</p>
            </div>
            <div>
              <div className="font-bold text-white mb-2 flex items-center gap-1.5"><GitBranch className="w-4 h-4" />GitHub to study</div>
              {detail.github_repos.map((r) => (
                <a key={r.name} href={r.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 mb-1.5 text-gray-200">
                  <span className="font-mono text-xs">{r.name}</span><span className="text-[11px] text-gray-300">★ {r.stars} <ExternalLink className="w-3 h-3 inline" /></span>
                </a>
              ))}
            </div>
            <div>
              <div className="font-bold text-white mb-2 flex items-center gap-1.5"><BookOpen className="w-4 h-4" />Resources</div>
              {detail.resources.map((r) => (
                <a key={r.title} href={r.url} target="_blank" rel="noreferrer" className="block p-2.5 rounded-lg bg-white/5 hover:bg-white/10 mb-1.5 text-gray-200 text-[13px]">{r.title} ↗</a>
              ))}
            </div>
            <div>
              <div className="font-bold text-white mb-2 flex items-center gap-1.5"><HelpCircle className="w-4 h-4" />Interview Qs</div>
              <ol className="list-decimal ml-5 space-y-1.5 text-gray-300 text-[13px]">{detail.interview_questions.map((q) => <li key={q}>{q}</li>)}</ol>
            </div>
            <div>
              <div className="font-bold text-white mb-2 flex items-center gap-1.5"><Users className="w-4 h-4" />People who took this path</div>
              {detail.people_path.map((p) => (
                <div key={p.role} className="p-2.5 rounded-lg bg-white/5 mb-1.5"><div className="font-semibold text-white text-[13px]">{p.role}</div><div className="text-gray-400 text-xs">{p.detail}</div></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
