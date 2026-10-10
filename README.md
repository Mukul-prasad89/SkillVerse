# Skillverse 
###AI-Powered Career Intelligence & Roadmapping


**Problem Statement 1 — Reverse-Engineered Career Roadmapper**

**Live Demo:** https://career-mapper-eight.vercel.app/

## 1. What It Does

Skillverse transforms a user's dream job into a personalized, interactive career roadmap. It helps students identify skill gaps, understand career progression, discover practical projects, and track their journey toward their target role instead of relying on generic career advice.

## 2. Key Features — PS 1

- **AI-generated personalized roadmaps** based on the user's target role and existing skills, rather than predefined templates.
- **Interactive skill graph** with clickable milestones and visual skill dependencies.
- **Actionable milestones** with relevant projects, learning resources, and interview preparation.
- **Dynamic roadmap updates** when users mark skills as already known or update their progress.
- **Target-specific career planning** based on the user's desired role and company type.

## 3. Done / Left / Plan

**Done:** Core frontend and backend, AI-powered roadmap generation, interactive visualization, milestone guidance, and progress-based roadmap updates are implemented and deployed.

**Left:** According to the problem statement ask everything is ticked.

**Next:** Test the complete user journey, handle AI and API failures, refine the UI, verify deployment, and add future improvements.

## 4. Architecture & Why

- **Frontend:** React, TypeScript, and React Flow for a responsive, interactive career graph.
- **Backend:** Python and FastAPI for API handling and roadmap processing.
- **AI orchestration:** LangChain coordinates prompt construction, LLM calls, and structured output processing.
- **LLM:** Interprets career goals and generates role-specific skills, projects, and learning recommendations Open router api key that uses multi model api depending upon the usage and traffic.
- **Validation & graph processing:** Pydantic validates structured data; graph logic manages skill dependencies and roadmap updates.
- **Deployment:** Vercel hosts the frontend, while Render hosts the backend.

The AI generates the roadmap dynamically. Application logic processes the output and updates the learning path as the user's skills change.

## 5. What We Added Beyond the Brief

**Future innovations:**
- **Career Tunnel:** Practical role-specific challenges evaluated against defined rubrics.
- **Evidence-Based Skill Confidence:** Distinguishes self-reported skills from skills demonstrated through assessments.
- **Alternative Career Paths:** Explores different routes toward the same target role.

## 6. How to Run It

**Live application:** https://career-mapper-eight.vercel.app/

**Local setup:**

1. Clone the repository: `git clone https://github.com/Mukul-prasad89/SkillVerse.git`
2. Install backend dependencies from `backend/requirements.txt`.
3. Configure the required environment variables using `backend/.env.example`.
4. Start the FastAPI backend using the application's configured entry point.
5. Install frontend dependencies using `npm install` in the frontend directory and run `npm run dev`.

**Deployment note:** The backend is hosted on Render and may sleep after inactivity. The first request can take longer while the service wakes up.

## 7. Tools and AI Used

React, TypeScript, React Flow, Python, FastAPI, LangChain, an LLM API, and Pydantic. Graph-processing libraries are used where configured in the implementation.

Skillverse transparently uses AI to generate recommendations. These are guidance, not guarantees of employment or professional competence.

## 8. Who It Is For

College students, fresh graduates, internship seekers, and early-career professionals who want a clear, personalized path toward a specific career.

**Our Vision:** Turn career aspirations into structured, actionable, and adaptive learning journeys.

---

**Skillverse — From Dream Career to Clear Direction.**
