// Mock AI engine — used until FastAPI backend is live.
// Generates realistic, non-generic roadmaps based on goal keywords.

const pick = (goal) => {
  const g = goal.toLowerCase()
  if (g.includes('ux') || g.includes('design') || g.includes('fintech') && g.includes('design'))
    return 'design'
  if (g.includes('ml') || g.includes('health') || g.includes('ai') && g.includes('model')) return 'ml'
  if (g.includes('backend') || g.includes('e-com') || g.includes('ecom')) return 'backend'
  if (g.includes('mobile') || g.includes('edtech') || g.includes('flutter')) return 'mobile'
  if (g.includes('data') || g.includes('sport')) return 'data'
  if (g.includes('devops') || g.includes('cloud') || g.includes('infra')) return 'devops'
  return 'fullstack'
}

function baseNodes(goal, hours = 10, months = 6) {
  const scale = Math.max(0.6, Math.min(1.4, (hours * months) / 60))
  const h = (v) => Math.round(v * scale)
  return {
    fullstack: [
      { id: 'n1', phase: 'Foundation', label: 'Git + JS Deep Dive', type: 'skill', desc: 'Closures, async, modules. Ship 3 CLI tools.', hours: h(14) },
      { id: 'n2', phase: 'Foundation', label: 'React + Tailwind Portfolio', type: 'project', desc: 'Carbon-footprint calculator with charts.', hours: h(18) },
      { id: 'n3', phase: 'Core', label: 'Node + Postgres APIs', type: 'skill', desc: 'Auth, Prisma, REST + pagination.', hours: h(20) },
      { id: 'n4', phase: 'Core', label: 'State Management Mastery', type: 'skill', desc: 'Zustand + React Query, optimistic UI.', hours: h(12) },
      { id: 'n5', phase: 'Core', label: 'Freelance / Internship', type: 'role', desc: 'Real client work: SaaS landing + dashboard.', hours: h(30) },
      { id: 'n6', phase: 'Specialization', label: 'Climate Data Viz (D3 + Maps)', type: 'project', desc: 'Mapbox emissions map with open climate data.', hours: h(22) },
      { id: 'n7', phase: 'Specialization', label: 'AWS Certified Cloud Practitioner', type: 'cert', desc: 'Real cert hiring managers filter for.', hours: h(15) },
      { id: 'n8', phase: 'Job-Ready', label: 'Jr Full Stack @ Climate Startup', type: 'role', desc: 'Own MRV dashboard features end-to-end.', hours: h(40) },
      { id: 'n9', phase: 'Job-Ready', label: 'Dream Role: Full Stack @ Climate', type: 'milestone', desc: 'Offer + on-site interview prep done.', hours: h(10) },
    ],
    design: [
      { id: 'n1', phase: 'Foundation', label: 'Figma Auto-layout Mastery', type: 'skill', desc: 'Variants, tokens, responsive frames.', hours: h(12) },
      { id: 'n2', phase: 'Foundation', label: 'UX Research Basics', type: 'skill', desc: '5 user interviews + affinity map.', hours: h(10) },
      { id: 'n3', phase: 'Core', label: 'Fintech KYC Redesign', type: 'project', desc: 'Reduce drop-off in onboarding flow.', hours: h(20) },
      { id: 'n4', phase: 'Core', label: 'Design Intern @ Fintech', type: 'role', desc: 'Ship 2 real flows with PM + eng.', hours: h(30) },
      { id: 'n5', phase: 'Specialization', label: 'Trading Dashboard Case Study', type: 'project', desc: 'Data-dense table + accessibility pass.', hours: h(18) },
      { id: 'n6', phase: 'Specialization', label: 'Google UX Certificate', type: 'cert', desc: 'Portfolio-ready credential.', hours: h(15) },
      { id: 'n7', phase: 'Job-Ready', label: 'Dream Role: Product Designer Fintech', type: 'milestone', desc: 'Portfolio + whiteboard challenge ready.', hours: h(10) },
    ],
    ml: [
      { id: 'n1', phase: 'Foundation', label: 'Python + SQL for ML', type: 'skill', desc: 'Pandas, eval splits, leakage checks.', hours: h(16) },
      { id: 'n2', phase: 'Core', label: 'PyTorch + HuggingFace', type: 'skill', desc: 'Fine-tune BioBERT on MIMIC demo.', hours: h(24) },
      { id: 'n3', phase: 'Core', label: 'Chest X-ray Classifier', type: 'project', desc: 'With Grad-CAM + model card.', hours: h(22) },
      { id: 'n4', phase: 'Specialization', label: 'MLOps: Docker + Weights&Biases', type: 'skill', desc: 'Repro runs + CI eval gates.', hours: h(16) },
      { id: 'n5', phase: 'Specialization', label: 'ML Intern @ HealthTech', type: 'role', desc: 'Own eval pipeline for 1 model.', hours: h(40) },
      { id: 'n6', phase: 'Job-Ready', label: 'Dream Role: ML Engineer Health', type: 'milestone', desc: 'System design + ML case ready.', hours: h(12) },
    ],
    backend: [
      { id: 'n1', phase: 'Foundation', label: 'Node + Express Deep Dive', type: 'skill', desc: 'Middleware, queues, idempotency.', hours: h(16) },
      { id: 'n2', phase: 'Core', label: 'Postgres + Redis Caching', type: 'skill', desc: 'Indexes, transactions, cache invalidation.', hours: h(18) },
      { id: 'n3', phase: 'Core', label: 'Stripe Checkout Clone', type: 'project', desc: 'Webhooks + retry-safe orders.', hours: h(22) },
      { id: 'n4', phase: 'Specialization', label: 'Load Test 10k RPS', type: 'project', desc: 'k6 + Grafana dashboards.', hours: h(14) },
      { id: 'n5', phase: 'Job-Ready', label: 'Backend Dev @ E-commerce', type: 'milestone', desc: 'System design: checkout scale.', hours: h(12) },
    ],
    mobile: [
      { id: 'n1', phase: 'Foundation', label: 'Dart + Flutter Widgets', type: 'skill', desc: 'State, navigation, animations.', hours: h(16) },
      { id: 'n2', phase: 'Core', label: 'Firebase Offline Sync', type: 'skill', desc: 'Firestore + local cache queue.', hours: h(18) },
      { id: 'n3', phase: 'Core', label: 'Quiz App for Low Bandwidth', type: 'project', desc: 'Works offline, syncs later.', hours: h(20) },
      { id: 'n4', phase: 'Job-Ready', label: 'Mobile Dev @ EdTech', type: 'milestone', desc: 'Play Store release + review.', hours: h(12) },
    ],
    data: [
      { id: 'n1', phase: 'Foundation', label: 'SQL Window Functions', type: 'skill', desc: 'Rank, lag, running totals on match data.', hours: h(12) },
      { id: 'n2', phase: 'Core', label: 'dbt + BigQuery Models', type: 'skill', desc: 'Staging -> marts for player stats.', hours: h(18) },
      { id: 'n3', phase: 'Core', label: 'Coach Dashboard (Tableau)', type: 'project', desc: 'xG + pressing maps.', hours: h(18) },
      { id: 'n4', phase: 'Job-Ready', label: 'Analyst @ SportsTech', type: 'milestone', desc: 'Take-home: tracking data story.', hours: h(10) },
    ],
    devops: [
      { id: 'n1', phase: 'Foundation', label: 'Linux + Networking', type: 'skill', desc: 'DNS, TLS, iptables basics.', hours: h(14) },
      { id: 'n2', phase: 'Core', label: 'AWS + Terraform', type: 'skill', desc: 'VPC, ECS, IaC modules.', hours: h(22) },
      { id: 'n3', phase: 'Core', label: 'K8s Zero-Downtime Deploy', type: 'project', desc: 'Rollouts, probes, HPA.', hours: h(20) },
      { id: 'n4', phase: 'Specialization', label: 'CKA Practice Labs', type: 'cert', desc: 'Real cert for infra roles.', hours: h(18) },
      { id: 'n5', phase: 'Job-Ready', label: 'DevOps @ Fintech', type: 'milestone', desc: 'PCI + incident drill ready.', hours: h(12) },
    ],
  }[pick(goal)] || []
}

const PHASES = ['Foundation', 'Core', 'Specialization', 'Job-Ready']

export function mockGenerate({ goal, hours_per_week = 10, timeline_months = 6 }) {
  const list = baseNodes(goal, hours_per_week, timeline_months)
  const phases = PHASES.filter((p) => list.some((n) => n.phase === p)).map((title, i) => ({
    id: `phase-${i + 1}`, title, order: i + 1,
  }))
  const phaseId = (name) => phases.find((p) => p.title === name)?.id
  const nodes = list.map((n) => ({
    id: n.id, phase_id: phaseId(n.phase), label: n.label, type: n.type,
    description: n.desc, depends_on: [], est_hours: n.hours, level: n.phase,
  }))
  // linear chain + branch for realism
  nodes.forEach((n, i) => { if (i > 0) n.depends_on = [nodes[i - 1].id] })
  const edges = nodes.slice(1).map((n, i) => ({ from: nodes[i].id, to: n.id }))
  return { goal, phases, nodes, edges, meta: { hours_per_week, timeline_months, mock: true } }
}

export function mockNodeDetail({ node_id, goal, label }) {
  const name = label || node_id
  return {
    node_id,
    weekend_project: `Weekend build: mini ${name} clone — 6hr sprint, deploy to Vercel, record 2-min Loom. Tailored for: ${goal}.`,
    github_repos: [
      { name: 'awesome-' + node_id + '-starter', url: 'https://github.com/topics/' + encodeURIComponent(name), stars: '4.2k' },
      { name: 'realworld-example', url: 'https://github.com/gothinkster/realworld', stars: '84k' },
    ],
    resources: [
      { title: `Official docs deep-dive: ${name}`, url: 'https://roadmap.sh' },
      { title: `Best free course: ${name} in 4hrs`, url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name) },
    ],
    interview_questions: [
      `Explain ${name} to a junior in 2 minutes.`,
      `What breaks at scale with ${name}? How do you fix it?`,
      `Walk through a bug you debugged in ${name}.`,
      `Compare 2 approaches for ${name} — trade-offs?`,
      `Live task: implement core ${name} pattern in 20 min.`,
    ],
    people_path: [
      { role: 'Intern / Freelancer', detail: 'Did 2 small paid gigs using ' + name },
      { role: 'Junior (6-12mo)', detail: 'Owned 1 feature using ' + name + ' end-to-end' },
      { role: 'Target role', detail: 'Uses ' + name + ' weekly in production' },
    ],
  }
}

export function mockReplan({ nodes, known_skills = [] }) {
  const known = new Set(known_skills.map((s) => s.toLowerCase()))
  const filtered = nodes.filter((n) => !known.has(n.label.toLowerCase()) && !known.has(n.id.toLowerCase()))
  // re-chain deps
  filtered.forEach((n, i) => { n.depends_on = i === 0 ? [] : [filtered[i - 1].id] })
  return { nodes: filtered, edges: filtered.slice(1).map((n, i) => ({ from: filtered[i].id, to: n.id })), skipped: nodes.length - filtered.length }
}
