# AI-Powered Healthcare Monitoring Agent

An AI-driven healthcare monitoring platform that combines Retrieval-Augmented Generation (RAG), multi-agent orchestration, medical knowledge retrieval, and vitals-aware monitoring to provide structured healthcare insights, patient risk summaries, and intelligent medical assistance.

The system is designed to support healthcare-related question answering, patient monitoring workflows, medication awareness, and health-risk evaluation through an interactive AI-powered assistant.

---

## My Contributions

Worked as a Full Stack / AI Engineer focusing on system setup, monitoring workflows, frontend enhancements, backend APIs, and developer experience improvements.

Key contributions include:

- Rebranded and restructured the project as **AI-Powered Healthcare Monitoring Agent**.
- Designed and implemented a vitals monitoring API endpoint: `POST /monitoring/summary`.
- Added monitoring-focused dashboard sections with patient snapshot cards and healthcare insights UI.
- Improved frontend user experience and monitoring visualization flows.
- Fixed Windows environment startup issues caused by non-ASCII backend logging symbols.
- Configured and stabilized local development environments for both frontend and backend services.
- Added project documentation, setup instructions, walkthroughs, presentation materials, and demo flows.
- Enhanced healthcare monitoring explanations and structured response formatting.
- Assisted in backend integration and API workflow validation.
- Improved project maintainability and development onboarding experience.

---

## What The Platform Does

- Answers healthcare-related questions using a hybrid RAG architecture.
- Retrieves contextual information from medical, disease, nutrition, and medication knowledge sources.
- Provides AI-assisted healthcare monitoring summaries based on patient vitals.
- Generates structured alerts, risk indicators, and recommendations.
- Supports conversation memory for contextual healthcare discussions.
- Exposes FastAPI-based endpoints for monitoring, chat, predictions, interaction checks, and profile management.
- Provides a modern React frontend with authentication and monitoring workflows.
- Integrates with Supabase for authentication, profiles, and conversation history.

---

## 🚀 Quick Setup

**For local development:**
1. Read [SETUP.md](./SETUP.md) for frontend & backend setup
2. Read [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for Supabase integration
3. See [SUPABASE_QUICK_REF.md](./SUPABASE_QUICK_REF.md) for quick reference

---

## Core Features

- Hybrid retrieval pipeline using FAISS + BM25 + reranking.
- Multi-agent backend orchestration architecture.
- AI-powered healthcare question answering.
- Drug interaction and health-risk tooling.
- Vitals monitoring with risk scoring and recommendations.
- Monitoring dashboard with patient summary cards.
- Conversation memory and contextual follow-up support.
- Responsive UI with dark/light theme support.
- Local-first architecture with downloadable RAG assets.
- Structured monitoring summaries for:
  - Blood Pressure
  - Heart Rate
  - Temperature
  - Glucose Levels
  - Oxygen Saturation

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- Supabase JS

### Backend
- Python
- FastAPI
- Uvicorn
- FAISS
- Sentence Transformers
- Cross-Encoder Reranking
- BM25
- Supabase Python Client

---

## Architecture Overview

```text
backend/
  agent/                 Multi-agent orchestration modules
  retrieval/             Hybrid RAG retrieval pipeline
  tools/                 Drug, risk, alert, analytics tools
  utils/                 Utilities and download helpers
  api.py                 FastAPI application entrypoint
  requirements.txt       Backend dependencies

frontend/
  src/
    components/          Shared UI components
    pages/               Home, Chat, About, Login, Signup
    context/             Authentication and theme providers
  public/                Static assets and branding
  package.json           Frontend dependencies

docs/
  CONTRIBUTIONS.md
  DEMO_SCRIPT.md
  PRESENTATION_OUTLINE.md
  PROJECT_WALKTHROUGH.md
