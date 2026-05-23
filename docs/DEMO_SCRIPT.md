# Demo Script

## Demo Goal

Show that the project is a working AI-powered healthcare monitoring agent, not only a static frontend.

## 1. Start With The Problem

"Healthcare users often need quick, understandable guidance about symptoms, medications, nutrition, and basic vitals. This project combines retrieval-augmented medical answers with a monitoring layer for patient signals."

## 2. Show The Home Page

Open:

```text
http://127.0.0.1:8080
```

Point out:

- project name
- monitoring layer
- patient snapshot cards
- hybrid RAG and multi-agent features

## 3. Show Backend Health

Open:

```text
http://127.0.0.1:8000/health
```

Expected:

```json
{ "status": "ok" }
```

## 4. Show Swagger Docs

Open:

```text
http://127.0.0.1:8000/docs
```

Point out:

- `/ask`
- `/monitoring/summary`
- `/interaction`
- `/predict`
- `/profile`

## 5. Demo Monitoring Endpoint

Use Swagger or PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://127.0.0.1:8000/monitoring/summary `
  -ContentType 'application/json' `
  -Body '{"age":55,"systolic_bp":160,"diastolic_bp":95,"heart_rate":92,"temperature_c":37.1,"glucose_mg_dl":112,"oxygen_saturation":97}'
```

Explain:

"The endpoint returns a watch status because the blood pressure is elevated, then gives a practical recommendation while keeping a medical disclaimer."

## 6. Demo Chat Query

Example:

```text
bp 160
```

Explain:

"The chat path is separate from the deterministic monitoring summary. It uses the backend agent flow and can handle natural language."

## 7. Explain The Architecture

Use this short explanation:

"The frontend is React and Vite. The backend is FastAPI. The medical answering flow uses a hybrid retriever with FAISS, BM25, and reranking. I added the monitoring endpoint as a separate explainable component because vitals interpretation should be predictable and easy to test."

## 8. Close With Improvements

Mention future work:

- trend charts for vitals
- doctor dashboard
- alerts by email/SMS
- stronger medical validation
- user-specific monitoring history
