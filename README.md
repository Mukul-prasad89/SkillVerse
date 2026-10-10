# Skillverse
## AI-Powered Career Intelligence & Roadmapping

**Problem Statement 1 — Reverse-Engineered Career Roadmapper**

**Live Demo:** https://career-mapper-eight.vercel.app/ 

The application is designed to work on both desktop and mobile devices.
### Expected Initial Loading Time

The application uses free-tier hosting and AI API access. Consequently, response times can be higher than those of a continuously running, production-grade deployment.

- **Initial backend wake-up:** Approximately 60 seconds after a period of inactivity, because the Render free-tier service may enter a sleeping state.
- **Subsequent requests:** May respond faster once the backend is awake, although actual latency depends on server availability, model selection, API traffic, and response complexity.


## 1. What It Does

Skillverse transforms a user's dream job into a personalized, interactive career roadmap. It helps students identify skill gaps, understand career progression, discover practical projects, and track their journey toward a target role instead of relying on generic career advice.

## 2. Key Features — PS 1

- **AI-Generated Personalized Roadmaps:** Generates career paths based on the user's target role and existing skills instead of relying exclusively on predefined templates.
- **Interactive Skill Graph:** Displays skills, milestones, and their dependencies in an interactive visual graph.
- **Actionable Milestones:** Provides relevant projects, learning resources, and interview preparation guidance.
- **Dynamic Roadmap Updates:** Adapts the learning path when users mark skills as already known or update their progress.
- **Target-Specific Career Planning:** Supports career planning based on the user's desired role and target company type.
- **Responsive User Interface:** Provides an accessible experience across desktop and mobile devices.

## 3. Implementation Status

**Completed**
- Core frontend and backend implementation.
- AI-powered career roadmap generation.
- Interactive career and skill visualization.
- Milestone-level learning guidance.
- Progress-based roadmap updates.
- Frontend and backend deployment.

**Remaining Validation and Improvements**
- Handle API timeouts
- Refine UI responsiveness and user experience.

The core functionality described in Problem Statement 1 has been implemented. Final testing and reliability improvements remain important for validating the complete experience.

## 4. System Architecture and Technology Choices

### Frontend
- **React:** Builds the component-based user interface.
- **JavaScript:** Support application logic, interactivity, data handling, and type-safe development where applicable.
- **Vercel:** Hosts the frontend application.

### Backend
- **Python:** Handles backend processing and application logic.
- **FastAPI:** Provides API endpoints for communication between the frontend and backend.
- **Pydantic:** Validates structured data and helps ensure that AI-generated roadmap information follows the expected schema.
- **Render:** Hosts the backend API.

### AI Orchestration and Generation
- **LangChain:** Coordinates prompt construction, language-model calls, and structured output processing.
- **OpenRouter API:** Provides access to supported language models through a unified API. Model selection can be configured according to availability, cost, and application requirements.
- **Graph Processing Logic:** Organizes generated skills into dependencies and processes roadmap updates when the user's skills or progress change.

### How the Components Work Together

1. The user enters a target career, existing skills, and relevant preferences.
2. The React frontend sends the information to the FastAPI backend.
3. LangChain prepares the request and coordinates the language-model interaction through OpenRouter.
4. The AI generates a structured career roadmap containing skills, milestones, projects, and learning recommendations.
5. Pydantic validates the response, and backend graph-processing logic organizes the dependencies.
6. The frontend renders the resulting roadmap using React Flow.
7. When the user updates their skills or progress, the application processes the changes and updates the learning path.

## 5. Deployment and First-Run Performance

**Frontend:** Vercel  
**Backend:** Render  
**AI Provider:** OpenRouter API using a free-tier model/API configuration.



**Recommended user-facing message:**

> First-time loading may take around 60 seconds while the backend starts. AI-powered roadmap generation may take approximately another 20 seconds depending on API availability and traffic. Please wait for the process to complete.

## 6. What We Added Beyond the Brief

The following are proposed future enhancements rather than confirmed implemented features.

- **Career Tunnel:** Role-specific practical challenges evaluated against defined rubrics.
- **Evidence-Based Skill Confidence:** Distinguishes self-reported skills from skills demonstrated through assessments.
- **Alternative Career Paths:** Explores multiple routes toward the same target role.
- **Assessment-Driven Roadmaps:** Uses demonstrated performance to improve recommendations and identify skill gaps.

These additions could help evolve Skillverse from a roadmap generator into a more comprehensive career intelligence platform.

| Category | Technologies |
|---|---|
| Frontend | React, JavaScript, TypeScript |
| Visualization | React Flow |
| Backend | Python, FastAPI |
| AI orchestration | LangChain |
| Language-model access | OpenRouter API |
| Data validation | Pydantic |
| Graph processing | Application-specific graph logic and configured libraries |
| Frontend deployment | Vercel |
| Backend deployment | Render |
| Development workflow | Git, GitHub |

Skillverse uses AI to generate personalized career recommendations. These recommendations are intended as guidance and do not guarantee employment, interview success, or professional competence.

## 9. Target Users

- College students exploring career options.
- Final-year students preparing for placements.
- Fresh graduates seeking internships or entry-level roles.
- Early-career professionals planning a transition into another role.
- Learners who need a structured, project-oriented path toward a specific career.
![Skillverse Screenshot](https://github.com/user-attachments/assets/46f39b17-402e-4fac-8c43-94f124e4ef3e)


To turn career aspirations into structured, actionable, and adaptive learning journeys by connecting career goals with the skills, projects, and milestones needed to pursue them.

**Skillverse — From Dream Career to Clear Direction.**
