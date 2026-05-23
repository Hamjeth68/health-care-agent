# AI-Powered Healthcare Monitoring Agent

An AI healthcare monitoring system that combines medical retrieval, tool-based reasoning, and vitals-aware risk summaries. The project is designed as a practical assistant for asking health questions, checking medication and risk signals, and explaining monitored vitals in a safer, structured way.

## Built / Modified By

Customized and extended by **Hamjeth** as a personal AI healthcare monitoring project.

My contribution focus:

- Rebranded the project as **AI-Powered Healthcare Monitoring Agent**.
- Added a vitals monitoring API endpoint: `POST /monitoring/summary`.
- Added a monitoring-focused home page section with patient snapshot cards.
- Cleaned Windows startup issues caused by non-ASCII backend log symbols.
- Set up the local development environment for frontend and backend.
- Added documentation, demo flow, presentation outline, and explanation material.

## What It Does

- Answers healthcare questions using a hybrid RAG pipeline.
- Retrieves from medical, drug, disease, nutrition, and guideline knowledge.
- Uses a FastAPI backend with endpoints for chat, prediction, interaction checks, profiles, and monitoring summaries.
- Provides a React frontend with Home, Chat, About, Login, and Signup flows.
- Supports Supabase auth/profile/history integration when credentials are configured.
- Produces vitals-aware summaries for blood pressure, heart rate, temperature, glucose, and oxygen saturation.

## Main Features

- Hybrid retrieval with FAISS, BM25, and reranking.
- Multi-agent backend structure for retrieval, response generation, and tool routing.
- Drug interaction and health risk tooling.
- Conversation memory for follow-up questions.
- Vitals monitoring summary endpoint with risk status, alerts, and recommendations.
- Clean healthcare monitoring UI with light/dark theme support.
- Local-first setup with downloaded RAG assets.

## Tech Stack

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- Supabase JS

Backend:

- Python
- FastAPI
- Uvicorn
- FAISS
- Sentence Transformers
- Cross-Encoder reranking
- BM25
- Supabase Python client

## Project Structure

```text
backend/
  agent/                 Multi-agent pipeline modules
  retrieval/             Hybrid RAG retriever
  tools/                 Drug, risk, alert, reminder, analytics tools
  utils/                 Download helpers
  api.py                 FastAPI application
  requirements.txt       Backend dependencies

frontend/
  src/
    components/          Navbar, chat message, sidebar, routes
    pages/               Home, Chat, About, Login, Signup
    context/             Auth and theme contexts
  public/                Logo, icons, manifest
  package.json           Frontend scripts and dependencies

docs/
  CONTRIBUTIONS.md
  DEMO_SCRIPT.md
  PRESENTATION_OUTLINE.md
  PROJECT_WALKTHROUGH.md
```

## Local URLs

After setup:

- Frontend: `http://127.0.0.1:8080`
- Backend health: `http://127.0.0.1:8000/health`
- Swagger API docs: `http://127.0.0.1:8000/docs`

## Quick Start

Backend:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
cd backend
..\.venv\Scripts\python.exe -m uvicorn api:app --host 127.0.0.1 --port 8000
```

Frontend:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 8080
```

## Environment Variables

Frontend uses `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Backend can use `backend/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CORS_ALLOW_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

## New Monitoring API

Endpoint:

```http
POST /monitoring/summary
```

Example request:

```json
{
  "age": 55,
  "systolic_bp": 160,
  "diastolic_bp": 95,
  "heart_rate": 92,
  "temperature_c": 37.1,
  "glucose_mg_dl": 112,
  "oxygen_saturation": 97
}
```

Example response:

```json
{
  "status": "watch",
  "risk_score": 2,
  "alerts": ["Blood pressure is elevated."],
  "recommendations": ["Rest, recheck blood pressure, reduce salt/caffeine today, and consult a clinician if it stays high."],
  "disclaimer": "This monitoring summary is informational and does not replace professional medical advice."
}
```

## Important Safety Note

This project is for educational and informational use. It does not diagnose disease, prescribe treatment, or replace a qualified healthcare professional.

## Supporting Docs

- [Setup Guide](SETUP.md)
- [Contribution Record](docs/CONTRIBUTIONS.md)
- [Project Walkthrough](docs/PROJECT_WALKTHROUGH.md)
- [Demo Script](docs/DEMO_SCRIPT.md)
- [Presentation Outline](docs/PRESENTATION_OUTLINE.md)
