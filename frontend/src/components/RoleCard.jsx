import { motion } from 'framer-motion'
import { Clock, BarChart3 } from 'lucide-react'

export default function RoleCard({ role, selected, onSelect }) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={onSelect}
      className={`text-left p-5 rounded-2xl border transition w-full card-shine ${
        selected
          ? 'border-white/70 bg-white/10'
          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/[0.07]'
      }`}
    >
      <h3 className="font-display font-bold text-white leading-tight">{role.title}</h3>
      <p className="text-xs text-gray-400 mt-1 font-medium">{role.company}</p>
      <p className="text-xs text-gray-400 mt-2 line-clamp-2">{role.description}</p>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {role.skills.map((s) => (
          <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-gray-200">{s}</span>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-400">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />~{role.months} mo</span>
        <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{role.difficulty}</span>
      </div>
    </motion.button>
  )
}
