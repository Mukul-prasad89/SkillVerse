import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 60000,
})

export async function generateRoadmap(payload) {
  // 1) Try the real AI pipeline: POST /api/roadmaps/generate (LangChain -> LLM -> validated JSON)
  try {
    const { data } = await api.post('/api/roadmaps/generate', toNewContract(payload))
    return adaptRoadmap(data, payload)
  } catch (e) {
    if (e?.response?.status !== 503) console.warn('AI pipeline unavailable, using fallback:', e?.message)
    else console.warn('LLM not configured on backend, using fallback roadmap.')
  }
  // 2) Legacy demo endpoint, 3) local mock — keeps hackathon demo working without keys
  try {
    const { data } = await api.post('/api/roadmap/generate', payload)
    return data
  } catch {
    const { mockGenerate } = await import('./mockRoadmap')
    await new Promise((r) => setTimeout(r, 1200))
    return mockGenerate(payload)
  }
}

// Map legacy frontend fields -> new RoadmapRequest contract (no field is discarded)
function toNewContract(p = {}) {
  const goal = p.goal || ''
  const parts = goal.split(/\s+at\s+|\s+for\s+/i)
  return {
    target_role: (parts[0] || goal || 'Software Engineer').trim(),
    company_type: (parts.slice(1).join(' ') || 'startup').trim(),
    experience_level: p.level || 'Student',
    background: p.background_text || (p.known_skills?.length ? `Known skills: ${p.known_skills.join(', ')}.` : 'Beginner student. No background provided.'),
    hours_per_week: p.hours_per_week ?? 10,
    timeline_months: p.timeline_months ?? 6,
  }
}

const TYPE_MAP = { skill: 'skill', project: 'project', certification: 'cert', experience: 'role', interview: 'skill', milestone: 'milestone' }

// Adapt new pipeline JSON -> the shape the React Flow tree already renders
function adaptRoadmap(data, payload) {
  const phaseOrder = {}
  const phases = (data.phases || []).map((ph, i) => {
    phaseOrder[ph.id] = i + 1
    return { id: ph.id, title: ph.name, order: i + 1, _meta: ph }
  })
  const nodes = (data.nodes || []).map((n) => ({
    id: n.id,
    phase_id: n.phase_id,
    label: n.title,
    type: TYPE_MAP[n.type] || 'skill',
    _kind: n.type,
    description: n.description || '',
    depends_on: n.prerequisites || [],
    est_hours: n.estimated_hours,
    level: n.current_proficiency,
    _detail: n,
  }))
  const edges = (data.edges || []).map((e) => ({ from: e.source, to: e.target, _rel: e.relationship }))
  return {
    goal: payload.goal || `${data.target?.role} at ${data.target?.company_type}`,
    phases, nodes, edges,
    meta: { ...(data.plan || {}), student_profile: data.student_profile, next_actions: data.next_actions, ai_pipeline: true },
    _raw: data, // original AI response — sent back on replan so the LLM revises it
  }
}

// AI replan: current AI roadmap + mastered node ids -> revised AI roadmap (throws on failure)
export async function replanRoadmapAI({ roadmap, known_node_ids, hours_per_week, timeline_months }) {
  const { data } = await api.post('/api/roadmaps/replan', {
    roadmap, known_node_ids, hours_per_week, timeline_months,
  })
  const adapted = adaptRoadmap(data, { goal: `${data.target.role} at ${data.target.company_type}` })
  adapted._knownIds = known_node_ids
  return adapted
}

export async function fetchNodeDetail(payload) {
  try {
    const { data } = await api.post('/api/node/detail', payload)
    return data
  } catch {
    const { mockNodeDetail } = await import('./mockRoadmap')
    await new Promise((r) => setTimeout(r, 700))
    return mockNodeDetail(payload)
  }
}

export async function replanRoadmap(payload) {
  try {
    const { data } = await api.post('/api/roadmap/replan', payload)
    return data
  } catch {
    const { mockReplan } = await import('./mockRoadmap')
    await new Promise((r) => setTimeout(r, 800))
    return mockReplan(payload)
  }
}

export default api
