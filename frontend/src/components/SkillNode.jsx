import { Handle, Position } from '@xyflow/react'
import { Check, Code2, Briefcase, Rocket, Award, Star } from 'lucide-react'

const TYPE_STYLE = {
  skill: { border: 'border-gray-400/60', bg: 'bg-white/[0.08]', text: 'text-gray-100', Icon: Code2 },
  role: { border: 'border-white/70', bg: 'bg-white/[0.12]', text: 'text-white', Icon: Briefcase },
  project: { border: 'border-gray-500/60 border-dashed', bg: 'bg-white/[0.05]', text: 'text-gray-200', Icon: Rocket },
  cert: { border: 'border-gray-300/50', bg: 'bg-white/[0.09]', text: 'text-gray-100', Icon: Award },
  milestone: { border: 'border-white', bg: 'bg-white/[0.14]', text: 'text-white', Icon: Star },
}

export default function SkillNode({ data }) {
  const s = TYPE_STYLE[data.type] || TYPE_STYLE.skill
  const { Icon } = s
  const done = data.completed
  const skipped = data.skipped
  const d = data._detail || {}
  const weeks = d.start_week ? `W${d.start_week}–${d.end_week}` : null
  const prioColor = d.priority === 'high' ? 'bg-white' : d.priority === 'low' ? 'bg-gray-600' : 'bg-gray-400'
  return (
    <div
      className={`min-w-[200px] max-w-[240px] px-4 py-3 rounded-2xl border-2 ${s.border} ${s.bg} backdrop-blur transition cursor-pointer ${
        done ? '!border-white !bg-white/20' : ''
      } ${skipped ? 'opacity-40 grayscale' : ''} ${data.selected ? 'ring-2 ring-white/60' : ''} ${data.startHere && !done ? 'ring-2 ring-white/70' : ''}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-white/40" />
      {data.startHere && !done && (
        <div className="text-[10px] font-bold text-white uppercase tracking-wider mb-1">▶ Start here</div>
      )}
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${done ? 'text-white' : s.text}`} />
        <div className="min-w-0">
          <div className={`text-[13px] font-bold leading-tight ${done ? 'text-gray-100 line-through' : 'text-white'}`}>{data.label}</div>
          <div className="text-[10px] uppercase tracking-wide mt-1 opacity-70 font-semibold text-gray-300">
            {data._kind && data._kind !== data.type ? `${data._kind} • ` : ''}{data.type} • {data.est_hours}h{weeks ? ` • ${weeks}` : ''}
          </div>
          {(d.priority || d.target_proficiency) && (
            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-400">
              {d.priority && <span className={`w-1.5 h-1.5 rounded-full ${prioColor}`} title={`priority: ${d.priority}`} />}
              {d.priority && <span className="capitalize">{d.priority}</span>}
              {d.target_proficiency && <span className="ml-auto">Target: {d.target_proficiency}</span>}
            </div>
          )}
        </div>
        {done && <Check className="w-4 h-4 text-white ml-auto shrink-0" />}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-white/40" />
    </div>
  )
}

export { TYPE_STYLE }
