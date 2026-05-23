# Project Walkthrough

## One-Minute Explanation

AI-Powered Healthcare Monitoring Agent is a full-stack healthcare assistant. The frontend lets users log in, chat, and explore the system. The backend uses FastAPI, a hybrid RAG retriever, and healthcare tools to answer questions. I extended it with a vitals monitoring endpoint that turns common health readings into a structured risk summary.

## Architecture

```text
React Frontend
  -> FastAPI Backend
  -> Medical Agent / Tool Router
  -> Hybrid Retriever
  -> FAISS + BM25 + Cross-Encoder
  -> Grounded Response
```

The new monitoring flow is separate and deterministic:    

```text
Vitals Input
  -> /monitoring/summary
  -> Rule-based risk scoring
  -> Status + Alerts + Recommendations
```

## Frontend Flow

1. `frontend/src/App.tsx` defines routes.
2. `Navbar.tsx` provides navigation and theme toggle.
3. `HomePage.tsx` introduces the product and monitoring snapshot.
4. `ChatPage.tsx` sends user questions to `POST /ask`.
5. `AboutPage.tsx` explains the technology.
6. `AuthContext.tsx` manages Supabase sessions and profile loading.

## Backend Flow

1. `backend/api.py` creates the FastAPI app.
2. Startup checks/downloads FAISS and dataset assets.
3. `/ask` loads the medical agent and sends the query through the RAG pipeline.
4. `/interaction` checks drug interaction style queries.
5. `/predict` supports simple risk prediction.
6. `/monitoring/summary` creates a structured vitals summary.

## RAG Pipeline

The retriever uses:

- FAISS for vector search.
- BM25 for keyword matching.
- Entity matching for stronger domain relevance.
- Cross-encoder reranking for better final document ordering.

## Monitoring Endpoint Logic

`/monitoring/summary` accepts vital signs and calculates a risk score.

It checks:

- high or crisis-range blood pressure
- unusually high or low heart rate
- fever
- high or low glucose
- low oxygen saturation

It returns:

- `stable`, `watch`, or `urgent`
- a numeric risk score
- human-readable alerts
- practical recommendations
- a safety disclaimer

## Why This Design Is Defensible

The project avoids pretending to diagnose patients. RAG answers are grounded in retrieved knowledge, while vitals monitoring is rule-based and transparent. This makes it easier to explain, test, and improve safely.

## Files To Know Well

- `backend/api.py`: API endpoints and monitoring summary feature.
- `backend/retrieval/hybrid_retriever.py`: retrieval logic.
- `backend/agent/medical_agent.py`: agent entry point.
- `frontend/src/pages/HomePage.tsx`: main product UI and monitoring preview.
- `frontend/src/pages/ChatPage.tsx`: chat experience.
- `frontend/src/context/AuthContext.tsx`: authentication flow.
