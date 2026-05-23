# Presentation Outline

## Slide 1: Title

**AI-Powered Healthcare Monitoring Agent**

Subtitle: Hybrid RAG, multi-agent tools, and vitals-aware monitoring.

## Slide 2: Problem

- People ask health questions online without context or safety.
- Basic vitals can be confusing without guidance.
- Generic chatbots may hallucinate.
- Healthcare tools need grounded answers and clear disclaimers.

## Slide 3: Proposed Solution

- A web-based healthcare monitoring agent.
- RAG-based medical answering.
- Tool-based checks for risk and interactions.
- Vitals summary endpoint for monitoring signals.

## Slide 4: System Architecture

```text
React UI -> FastAPI -> Agent Controller -> Hybrid RAG -> FAISS/BM25/Reranker
```

Monitoring flow:

```text
Vitals -> Rule-Based Summary -> Status + Alerts + Recommendations
```

## Slide 5: Core Technologies

- React, TypeScript, Vite, Tailwind CSS
- FastAPI and Uvicorn
- FAISS vector index
- BM25 lexical retrieval
- Sentence Transformers
- Cross-Encoder reranker
- Supabase for auth/history

## Slide 6: My Main Contributions

- Rebranded and customized the project identity.
- Added `/monitoring/summary`.
- Added home page monitoring preview UI.
- Fixed Windows local setup issues.
- Created documentation, demo script, and walkthrough.

## Slide 7: Monitoring Feature

Inputs:

- blood pressure
- heart rate
- temperature
- glucose
- oxygen saturation

Outputs:

- stable/watch/urgent status
- risk score
- alerts
- recommendations
- disclaimer

## Slide 8: Demo

1. Open frontend.
2. Show monitoring preview.
3. Open Swagger.
4. Run `/monitoring/summary`.
5. Run `/ask` with a health query.

## Slide 9: Safety

- Informational only.
- Not a diagnosis.
- Encourages professional medical support.
- Uses grounded retrieval where possible.
- Keeps monitoring rules explainable.

## Slide 10: Future Work

- Store vitals history per user.
- Add trend charts.
- Add doctor dashboard.
- Add notification alerts.
- Add stronger clinical validation.
