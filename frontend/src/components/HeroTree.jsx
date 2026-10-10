import { ReactFlow, Background, Handle, Position } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion } from 'framer-motion'

function MiniNode({ data }) {
  return (
    <div className={`px-3 py-2 rounded-xl text-xs font-semibold border ${data.cls}`}>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0" />
      {data.label}
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" />
    </div>
  )
}

const nodeTypes = { mini: MiniNode }

const nodes = [
  { id: 'a', type: 'mini', position: { x: 120, y: 0 }, data: { label: 'Dream Role', cls: 'bg-white/15 border-white/50 text-white' } },
  { id: 'b', type: 'mini', position: { x: 20, y: 90 }, data: { label: 'React + State', cls: 'bg-white/10 border-white/30 text-gray-200' } },
  { id: 'c', type: 'mini', position: { x: 200, y: 90 }, data: { label: 'Node APIs', cls: 'bg-white/10 border-white/30 text-gray-200' } },
  { id: 'd', type: 'mini', position: { x: 20, y: 180 }, data: { label: 'Backend Project', cls: 'bg-white/[0.06] border-white/20 text-gray-300' } },
  { id: 'e', type: 'mini', position: { x: 200, y: 180 }, data: { label: 'Cloud Cert', cls: 'bg-white/[0.06] border-white/20 text-gray-300' } },
]
const edges = [
  { id: 'ab', source: 'a', target: 'b', animated: true, style: { stroke: '#d4d4d4' } },
  { id: 'ac', source: 'a', target: 'c', animated: true, style: { stroke: '#a3a3a3' } },
  { id: 'bd', source: 'b', target: 'd', animated: true, style: { stroke: '#737373' } },
  { id: 'ce', source: 'c', target: 'e', animated: true, style: { stroke: '#737373' } },
]

export default function HeroTree() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="w-full h-[380px] rounded-2xl glass overflow-hidden glow-violet"
    >
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView panOnDrag={false} zoomOnScroll={false} nodesDraggable={false} proOptions={{ hideAttribution: true }}>
        <Background gap={18} color="#262626" />
      </ReactFlow>
    </motion.div>
  )
}
