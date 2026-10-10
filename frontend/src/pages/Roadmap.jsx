import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import confetti from 'canvas-confetti'
import { toPng } from 'html-to-image'
import { ArrowLeft, Download, Share2, GitCompare, RotateCcw } from 'lucide-react'
import SkillNode from '../components/SkillNode'
import DetailPanel from '../components/DetailPanel'
import { useRoadmap } from '../lib/RoadmapContext'
import { replanRoadmap, replanRoadmapAI } from '../lib/api'

const nodeTypes = { skill: SkillNode }

// Layered layout driven by the AI's own phases: one row per phase,
// ordered by phase.order (falls back to array index). No hardcoded structure.
function layout(roadmap, completed, selectedId, skippedIds, startIds = []) {
  const sortedPhases = [...(roadmap.phases || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  )
  const rowOf = {}
  sortedPhases.forEach((p, i) => { rowOf[p.id] = i })
  const byPhase = {}
  ;(roadmap.nodes || []).forEach((n) => {
    const k = rowOf[n.phase_id] ?? 0
    if (!byPhase[k]) byPhase[k] = []
    byPhase[k].push(n)
  })
  const nodes = []
  Object.keys(byPhase).sort((a, b) => a - b).forEach((k) => {
    const row = Number(k)
    byPhase[k].forEach((n, col) => {
      nodes.push({
        id: n.id, type: 'skill',
        position: { x: col * 270 - (byPhase[k].length - 1) * 135, y: row * 190 },
        data: {
          ...n,
          completed: completed.includes(n.id),
          selected: selectedId === n.id,
          skipped: skippedIds.includes(n.id),
          startHere: startIds.includes(n.id),
        },
      })
    })
  })
  const edges = (roadmap.edges || []).map((e, i) => ({
    id: e._rel ? `${e.from}-${e.to}-${e._rel}` : `${e.from}-${e.to}-${i}`,
    source: e.from, target: e.to, animated: true,
    label: e._rel && e._rel !== 'prerequisite' ? e._rel : undefined,
    style: { stroke: completed.includes(e.from) ? '#ffffff' : '#525252', strokeWidth: 2 },
  }))
  return { nodes, edges, sortedPhases }
}

export default function Roadmap() {
  const { state, dispatch } = useRoadmap()
  const { roadmap, completed } = state
  const [selected, setSelected] = useState(null)
  const [skipped, setSkipped] = useState([])
  const [compareMode, setCompareMode] = useState(false)
  const flowRef = useRef(null)

  const startIds = (roadmap?.meta?.next_actions || []).map((a) => a.node_id)

  const { nodes: initNodes, edges: initEdges, sortedPhases } = useMemo(
    () => (roadmap ? layout(roadmap, completed, selected?.id, skipped, startIds) : { nodes: [], edges: [], sortedPhases: [] }),
    [roadmap, completed, selected, skipped]
  )
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)

  useEffect(() => { setNodes(initNodes) }, [initNodes])
  useEffect(() => { setEdges(initEdges) }, [initEdges])

  const onNodeClick = useCallback((_, node) => {
    setSelected(roadmap.nodes.find((n) => n.id === node.id))
    dispatch({ type: 'SELECT_NODE', payload: node.id })
  }, [roadmap])

  const complete = (id) => {
    if (!completed.includes(id)) {
      dispatch({ type: 'COMPLETE_NODE', payload: id })
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors: ['#ffffff', '#a3a3a3', '#525252'] })
    }
  }

  const [replanning, setReplanning] = useState(false)
  const [notice, setNotice] = useState(null)

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(null), 4500) }

  const markKnown = async (id, label) => {
    // Preferred: AI replan — send current AI JSON + mastered ids, get a revised roadmap back
    if (roadmap._raw) {
      setReplanning(true)
      try {
        const knownIds = [...new Set([...(roadmap._knownIds || []), id])]
        const revised = await replanRoadmapAI({
          roadmap: roadmap._raw,
          known_node_ids: knownIds,
          hours_per_week: roadmap.meta?.hours_per_week,
          timeline_months: roadmap.meta?.timeline_months,
        })
        const keep = completed.filter((c) => revised.nodes.some((n) => n.id === c))
        dispatch({ type: 'SET_ROADMAP', payload: revised })
        dispatch({ type: 'RESTORE_COMPLETED', payload: keep })
        setSelected(null)
        flash(`Roadmap rebuilt — “${label}” mastered, path rewired (${revised.nodes.length} steps).`)
        return
      } catch (e) {
        console.warn('AI replan failed, hiding node instead:', e?.message)
      } finally {
        setReplanning(false)
      }
    }
    // Fallback (legacy/mock roadmaps): hide the node locally
    setSkipped((s) => [...s, id])
    const result = await replanRoadmap({ nodes: roadmap.nodes, known_skills: [...state.known, label, id] })
    if (result.nodes) {
      dispatch({ type: 'UPDATE_ROADMAP', payload: { nodes: result.nodes, edges: result.edges } })
    }
    setSelected(null)
  }

  const reset = () => { setSkipped([]); setSelected(null) }

  const exportPng = async () => {
    if (!flowRef.current) return
    const dataUrl = await toPng(flowRef.current, { backgroundColor: '#000000' })
    const a = document.createElement('a')
    a.download = 'skillverse-roadmap.png'
    a.href = dataUrl
    a.click()
  }

  const share = async () => {
    const url = window.location.href
    try { await navigator.clipboard.writeText(url); alert('Roadmap link copied to clipboard') }
    catch { prompt('Copy your roadmap link:', url) }
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div>
          
          <h1 className="font-display text-2xl font-bold text-white">No roadmap yet</h1>
          <p className="text-gray-500 mt-2">Generate one from the dashboard first.</p>
          <Link to="/dashboard" className="inline-block mt-5 px-6 py-3 rounded-xl bg-white text-black font-semibold">Go to Dashboard</Link>
        </div>
      </div>
    )
  }

  const progress = Math.round((completed.length / roadmap.nodes.length) * 100)

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* TOPBAR */}
      <div className="border-b border-white/10 bg-black/90 backdrop-blur px-4 py-3 flex flex-wrap items-center gap-3">
        <Link to="/dashboard" className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-gray-300 font-bold">Your skill tree</div>
          <div className="font-display font-bold text-white truncate max-w-[300px] md:max-w-[420px]">{roadmap.goal}</div>
        </div>
        <div className="flex-1 min-w-[140px] max-w-xs ml-auto">
          <div className="flex justify-between text-[11px] text-gray-400 mb-1"><span>Progress</span><span className="text-white font-bold">{progress}% · {completed.length}/{roadmap.nodes.length}</span></div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCompareMode(!compareMode)} className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${compareMode ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'}`}><GitCompare className="w-3.5 h-3.5" />Compare</button>
          <button onClick={exportPng} className="px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 text-white hover:bg-white/15 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />PNG</button>
          <button onClick={share} className="px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 text-white hover:bg-white/15 flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" />Share</button>
          <button onClick={reset} className="px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 text-white hover:bg-white/15 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />Reset</button>
        </div>
      </div>

      {/* LEGEND */}
      <div className="px-4 py-2 flex flex-wrap gap-2 text-[11px] border-b border-white/5 bg-white/[0.02]">
        {[['skill', 'bg-white/[0.08] text-gray-100 border-white/25'], ['role', 'bg-white/[0.14] text-white border-white/50'], ['project', 'bg-white/[0.05] text-gray-200 border-white/20 border-dashed'], ['cert', 'bg-white/[0.10] text-gray-100 border-white/30'], ['milestone', 'bg-white/[0.16] text-white border-white']].map(([t, cls]) => (
          <span key={t} className={`px-2.5 py-1 rounded-full border ${cls} font-semibold uppercase tracking-wide`}>{t}</span>
        ))}
        <span className="text-gray-500 ml-auto hidden md:inline">Click any node → project + repos + interview Qs • Drag to pan • Scroll to zoom</span>
      </div>

      {/* PHASES — straight from the AI JSON, in AI order */}
      {(sortedPhases?.length > 0) && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto border-b border-white/5 bg-white/[0.02]">
          {sortedPhases.map((p, i) => {
            const done = (roadmap.nodes || []).filter((n) => n.phase_id === p.id && completed.includes(n.id)).length
            const total = (roadmap.nodes || []).filter((n) => n.phase_id === p.id).length
            const weeks = p._meta ? `W${p._meta.start_week}–${p._meta.end_week}` : ''
            return (
              <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 whitespace-nowrap text-xs">
                <span className="w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                <span className="font-semibold text-white">{p.title}</span>
                {weeks && <span className="text-gray-500">{weeks}</span>}
                <span className={done === total && total > 0 ? 'text-white font-bold' : 'text-gray-500'}>{done}/{total}</span>
              </div>
            )
          })}
          {roadmap.meta?.feasibility === 'over_capacity' && (
            <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/40 text-white text-xs whitespace-nowrap font-semibold">
              Capacity warning: over by {roadmap.meta.capacity_shortfall_hours}h — consider a longer timeline
            </div>
          )}
        </div>
      )}

      {/* CANVAS */}
      <div className="flex-1 relative" ref={flowRef}>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={onNodeClick} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }}>
          <Background gap={22} color="#1f1f1f" />
          <Controls className="!bg-[#0a0a0a] !border-white/10" />
          <MiniMap className="!bg-[#0a0a0a]" maskColor="rgba(0,0,0,0.75)" />
        </ReactFlow>
        <DetailPanel node={selected} goal={roadmap.goal} onClose={() => setSelected(null)} onComplete={complete} onKnown={markKnown} completed={completed} />
        {replanning && (
          <div className="absolute left-1/2 top-6 -translate-x-1/2 px-6 py-3 rounded-2xl bg-white text-black font-bold shadow-2xl animate-pulse">Rebuilding your roadmap…</div>
        )}
        {notice && !replanning && (
          <div className="absolute left-1/2 top-6 -translate-x-1/2 px-6 py-3 rounded-2xl bg-white text-black font-bold shadow-2xl border border-white/20 max-w-[90%] text-center text-sm">{notice}</div>
        )}
        {progress === 100 && (
          <div className="absolute left-1/2 top-6 -translate-x-1/2 px-6 py-3 rounded-2xl bg-white text-black font-bold shadow-2xl">ROADMAP COMPLETE — you’re job-ready!</div>
        )}
      </div>
    </div>
  )
}
