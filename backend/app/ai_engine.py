"""LangChain orchestration: LLM chains with graceful fallback to rule-based logic."""
import json
import os

from .roadmaps import extract_profile, build_roadmap

SYSTEM_PARSE = """You are a career-profile extractor for college students.
Given a GOAL and free-text BACKGROUND, extract:
- known_skills: list of canonical skill names (e.g. HTML, CSS, JavaScript, React, Node.js, Python, SQL, Figma)
- projects: list of short project names mentioned or implied
- level: one of Student, Fresher, 1yr+
- summary: 2 sentences, encouraging + specific about gaps
Return STRICT JSON only: {"known_skills":[...],"projects":[...],"level":"...","summary":"..."}"""

SYSTEM_ROADMAP = """You are a career roadmap planner. Given GOAL, KNOWN_SKILLS, HOURS_PER_WEEK, TIMELINE_MONTHS,
produce STRICT JSON: {"phases":[{"id":"phase-1","title":"Foundation","order":1},...],
"nodes":[{"id":"n1","phase_id":"phase-1","label":"...","type":"skill|role|project|cert|milestone","description":"...","depends_on":[],"est_hours":12,"level":"Foundation"}...],
"edges":[{"from":"n1","to":"n2"}...]}
Rules: 4 phases max, 6-9 nodes, realistic (real certs, real intermediate roles, concrete niche projects for THAT goal), skip known skills, fit total hours ≈ hours_per_week*4*timeline_months."""


def _chat_model():
    """Return a LangChain chat model if keys exist, else None."""
    try:
        if os.getenv("OPENAI_API_KEY"):
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"), temperature=0.4)
        if os.getenv("GOOGLE_API_KEY"):
            from langchain_community.chat_models import ChatOllama  # placeholder path
            return None
    except Exception:
        return None
    return None


def llm_parse_profile(goal: str, background_text: str) -> dict | None:
    model = _chat_model()
    if model is None or not background_text.strip():
        return None
    try:
        from langchain_core.prompts import ChatPromptTemplate
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PARSE),
            ("human", "GOAL: {goal}\nBACKGROUND: {bg}"),
        ])
        chain = prompt | model
        out = chain.invoke({"goal": goal, "bg": background_text}).content
        # strip code fences
        out = out.strip().removeprefix("```json").removeprefix("```").remsuffix("```").strip()
        data = json.loads(out)
        return {"known_skills": data.get("known_skills", []), "projects": data.get("projects", []),
                "level": data.get("level", "Student"), "summary": data.get("summary", ""), "llm_used": True}
    except Exception:
        return None


def llm_build_roadmap(goal, known_skills, hours, months) -> dict | None:
    model = _chat_model()
    if model is None:
        return None
    try:
        from langchain_core.prompts import ChatPromptTemplate
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_ROADMAP),
            ("human", "GOAL:{goal}\nKNOWN:{known}\nHOURS_PER_WEEK:{h}\nTIMELINE_MONTHS:{m}"),
        ])
        chain = prompt | model
        out = chain.invoke({"goal": goal, "known": ", ".join(known_skills) or "none", "h": hours, "m": months}).content
        out = out.strip().removeprefix("```json").removeprefix("```").remsuffix("```").strip()
        data = json.loads(out)
        data.setdefault("meta", {})["llm_used"] = True
        return data
    except Exception:
        return None


# Public API used by routes — always succeeds via fallback
def parse_profile(goal: str, background_text: str) -> dict:
    llm = llm_parse_profile(goal, background_text)
    if llm:
        return {**llm, "timeline_fit": "personalized by LLM"}
    base = extract_profile(background_text)
    return {**base, "timeline_fit": "rule-based fit (add OPENAI_API_KEY for LLM)", "llm_used": False}


def generate_roadmap(goal, background_text="", hours_per_week=10, timeline_months=6, known_skills=None, level="Student"):
    known = list(known_skills or [])
    # if background text has more skills, merge them in
    if background_text:
        extra = parse_profile(goal, background_text).get("known_skills", [])
        known = list(dict.fromkeys([*known, *extra]))
    llm = llm_build_roadmap(goal, known, hours_per_week, timeline_months)
    if llm:
        return llm
    data = build_roadmap(goal, hours_per_week, timeline_months, known)
    data["meta"]["llm_used"] = False
    data["meta"]["level"] = level
    return data


def node_detail(node_id: str, goal: str, label: str) -> dict:
    name = label or node_id
    return {
        "node_id": node_id,
        "weekend_project": f"Weekend build: mini {name} clone — 6hr sprint, deploy to Vercel, record 2-min Loom. Tailored for: {goal}.",
        "github_repos": [
            {"name": f"awesome-{node_id}-starter", "url": f"https://github.com/topics/{name}", "stars": "4.2k"},
            {"name": "realworld-example", "url": "https://github.com/gothinkster/realworld", "stars": "84k"},
        ],
        "resources": [
            {"title": f"Official docs deep-dive: {name}", "url": "https://roadmap.sh"},
            {"title": f"Best free course: {name} in 4hrs", "url": f"https://www.youtube.com/results?search_query={name}"},
        ],
        "interview_questions": [
            f"Explain {name} to a junior in 2 minutes.",
            f"What breaks at scale with {name}? How do you fix it?",
            f"Walk through a bug you debugged in {name}.",
            f"Compare 2 approaches for {name} — trade-offs?",
            f"Live task: implement core {name} pattern in 20 min.",
        ],
        "people_path": [
            {"role": "Intern / Freelancer", "detail": f"Did 2 small paid gigs using {name}"},
            {"role": "Junior (6-12mo)", "detail": f"Owned 1 feature using {name} end-to-end"},
            {"role": "Target role", "detail": f"Uses {name} weekly in production"},
        ],
    }
