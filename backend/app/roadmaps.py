"""Fallback roadmap templates + keyword extraction (used when no LLM key)."""
import re

SKILL_VOCAB = [
    "html", "css", "javascript", "typescript", "react", "next.js", "vue",
    "node", "express", "fastapi", "django", "python", "sql", "postgres",
    "mongodb", "prisma", "tailwind", "git", "docker", "aws", "figma",
    "pytorch", "pandas", "tableau", "dbt", "kubernetes", "terraform",
    "flutter", "dart", "firebase", "unity", "c#", "java", "redis",
    "graphql", "zustand", "react query", "d3", "mapbox",
]

CANON = {"js": "JavaScript", "javascript": "JavaScript", "c#": "C#", "next.js": "Next.js",
         "html": "HTML", "css": "CSS", "sql": "SQL", "aws": "AWS", "dbt": "dbt"}

NEG_WORDS = r"\b(no|not|haven't|havent|don't|dont|without|never|yet|need to learn|want to learn)\b"


def extract_profile(background_text: str) -> dict:
    low = (background_text or "").lower()
    found = []
    for s in SKILL_VOCAB:
        m = re.search(rf"(?<![a-z#+.]){re.escape(s)}(?![a-z#+])", low)
        if not m:
            continue
        # negation guard: skip if a negation word appears within 25 chars before the match
        window = low[max(0, m.start() - 30):m.start()]
        if re.search(NEG_WORDS, window):
            continue
        canon = CANON.get(s)
        if not canon:
            canon = s.upper() if len(s) <= 3 else s.title()
            if s == "react query": canon = "React Query"
        found.append(canon)
    # de-dupe preserve order
    seen, known = set(), []
    for f in found:
        if f.lower() not in seen:
            seen.add(f.lower())
            known.append(f)
    projects = []
    if re.search(r"portfolio|website|landing", low): projects.append("Portfolio website")
    if re.search(r"\btodo\b", low): projects.append("Todo app")
    if re.search(r"weather|api|fetch", low): projects.append("API-based app")
    if re.search(r"clone|dashboard|e-?commerce|kyc|trading", low): projects.append("Dashboard/clone project")
    if re.search(r"chat|bot|llm|rag", low): projects.append("AI chatbot experiment")
    if re.search(r"game|unity|shooter|platformer", low): projects.append("Game prototype")
    level = "Student"
    if len(known) >= 6 or re.search(r"intern|freelance|job|year|worked", low): level = "Fresher"
    if len(known) >= 9 or re.search(r"2\+? years|senior|lead|production", low): level = "1yr+"
    summary = f"Detected {len(known)} skill(s) and {len(projects)} project signal(s) from your text. " + (
        "Roadmap will skip what you know and focus on gaps." if known else "Starting from foundations."
    )
    return {"known_skills": known, "projects": projects, "level": level, "summary": summary}


def track_for_goal(goal: str) -> str:
    g = (goal or "").lower()
    if any(k in g for k in ["ux", "design", "figma"]): return "design"
    if any(k in g for k in ["ml", "health", "pytorch", "model"]): return "ml"
    if any(k in g for k in ["backend", "e-com", "ecom", "checkout"]): return "backend"
    if any(k in g for k in ["mobile", "edtech", "flutter"]): return "mobile"
    if any(k in g for k in ["data", "sport", "analyst"]): return "data"
    if any(k in g for k in ["devops", "cloud", "infra", "k8s"]): return "devops"
    return "fullstack"


TEMPLATES = {
    "fullstack": [
        ("Foundation", "skill", "Git + JS Deep Dive", "Closures, async, modules. Ship 3 CLI tools.", 14),
        ("Foundation", "project", "React + Tailwind Portfolio", "Carbon-footprint calculator with charts.", 18),
        ("Core", "skill", "Node + Postgres APIs", "Auth, Prisma, REST + pagination.", 20),
        ("Core", "skill", "State Management Mastery", "Zustand + React Query, optimistic UI.", 12),
        ("Core", "role", "Freelance / Internship", "Real client work: landing + dashboard.", 30),
        ("Specialization", "project", "Climate Data Viz (D3 + Maps)", "Mapbox emissions map with open climate data.", 22),
        ("Specialization", "cert", "AWS Certified Cloud Practitioner", "Cert hiring managers filter for.", 15),
        ("Job-Ready", "role", "Jr Full Stack @ Climate Startup", "Own MRV dashboard features end-to-end.", 40),
        ("Job-Ready", "milestone", "Dream Role Offer", "Offer + system-design interview prep done.", 10),
    ],
    "design": [
        ("Foundation", "skill", "Figma Auto-layout Mastery", "Variants, tokens, responsive frames.", 12),
        ("Foundation", "skill", "UX Research Basics", "5 user interviews + affinity map.", 10),
        ("Core", "project", "Fintech KYC Redesign", "Reduce drop-off in onboarding flow.", 20),
        ("Core", "role", "Design Intern @ Fintech", "Ship 2 real flows with PM + eng.", 30),
        ("Specialization", "project", "Trading Dashboard Case Study", "Data-dense table + accessibility pass.", 18),
        ("Specialization", "cert", "Google UX Certificate", "Portfolio-ready credential.", 15),
        ("Job-Ready", "milestone", "Product Designer @ Fintech", "Portfolio + whiteboard challenge ready.", 10),
    ],
    "ml": [
        ("Foundation", "skill", "Python + SQL for ML", "Pandas, eval splits, leakage checks.", 16),
        ("Core", "skill", "PyTorch + HuggingFace", "Fine-tune BioBERT on clinical demo.", 24),
        ("Core", "project", "Chest X-ray Classifier", "With Grad-CAM + model card.", 22),
        ("Specialization", "skill", "MLOps: Docker + W&B", "Repro runs + CI eval gates.", 16),
        ("Specialization", "role", "ML Intern @ HealthTech", "Own eval pipeline for 1 model.", 40),
        ("Job-Ready", "milestone", "ML Engineer @ HealthTech", "System design + ML case ready.", 12),
    ],
    "backend": [
        ("Foundation", "skill", "Node + Express Deep Dive", "Middleware, queues, idempotency.", 16),
        ("Core", "skill", "Postgres + Redis Caching", "Indexes, transactions, invalidation.", 18),
        ("Core", "project", "Stripe Checkout Clone", "Webhooks + retry-safe orders.", 22),
        ("Specialization", "project", "Load Test 10k RPS", "k6 + Grafana dashboards.", 14),
        ("Job-Ready", "milestone", "Backend Dev @ E-commerce", "System design: checkout scale.", 12),
    ],
    "mobile": [
        ("Foundation", "skill", "Dart + Flutter Widgets", "State, navigation, animations.", 16),
        ("Core", "skill", "Firebase Offline Sync", "Firestore + local cache queue.", 18),
        ("Core", "project", "Quiz App for Low Bandwidth", "Works offline, syncs later.", 20),
        ("Job-Ready", "milestone", "Mobile Dev @ EdTech", "Play Store release + review.", 12),
    ],
    "data": [
        ("Foundation", "skill", "SQL Window Functions", "Rank, lag on match data.", 12),
        ("Core", "skill", "dbt + BigQuery Models", "Staging → marts for player stats.", 18),
        ("Core", "project", "Coach Dashboard", "xG + pressing maps in Tableau.", 18),
        ("Job-Ready", "milestone", "Analyst @ SportsTech", "Take-home: tracking data story.", 10),
    ],
    "devops": [
        ("Foundation", "skill", "Linux + Networking", "DNS, TLS, iptables basics.", 14),
        ("Core", "skill", "AWS + Terraform", "VPC, ECS, IaC modules.", 22),
        ("Core", "project", "K8s Zero-Downtime Deploy", "Rollouts, probes, HPA.", 20),
        ("Specialization", "cert", "CKA Practice Labs", "Real cert for infra roles.", 18),
        ("Job-Ready", "milestone", "DevOps @ Fintech", "PCI + incident drill ready.", 12),
    ],
}

PHASE_ORDER = ["Foundation", "Core", "Specialization", "Job-Ready"]


def build_roadmap(goal, hours_per_week=10, timeline_months=6, known_skills=None):
    known = {k.lower() for k in (known_skills or [])}
    track = track_for_goal(goal)
    scale = max(0.6, min(1.4, (hours_per_week * timeline_months) / 60))
    raw = TEMPLATES[track]
    # filter nodes whose label mentions a known skill
    filtered = []
    for phase, ntype, label, desc, hrs in raw:
        if any(k and k in label.lower() for k in known):
            continue  # skip what student knows
        filtered.append((phase, ntype, label, desc, round(hrs * scale)))
    if not filtered:  # knew everything — give stretch goals
        filtered = [(p, t, l + " (Advanced)", d, h) for p, t, l, d, h in raw[-3:]]
    phases = [{"id": f"phase-{i+1}", "title": t, "order": i+1}
              for i, t in enumerate(PHASE_ORDER) if any(f[0] == t for f in filtered)]
    pid = {p["title"]: p["id"] for p in phases}
    nodes, edges = [], []
    for i, (phase, ntype, label, desc, hrs) in enumerate(filtered):
        nid = f"n{i+1}"
        nodes.append({"id": nid, "phase_id": pid[phase], "label": label, "type": ntype,
                      "description": desc, "depends_on": [f"n{i}"] if i else [],
                      "est_hours": hrs, "level": phase})
        if i: edges.append({"from": f"n{i}", "to": nid})
    total = sum(n["est_hours"] for n in nodes)
    return {"goal": goal, "phases": phases, "nodes": nodes, "edges": edges,
            "meta": {"hours_per_week": hours_per_week, "timeline_months": timeline_months,
                     "track": track, "total_hours": total, "skipped": len(raw) - len(filtered)}}
