# Local Setup Guide

This guide sets up **AI-Powered Healthcare Monitoring Agent** on Windows PowerShell.

## 1. Requirements

- Python 3.10 or 3.11
- Node.js 18+
- npm
- Git

This project was verified locally with:

- Python 3.11
- Node.js 24
- npm 11

## 2. Backend Setup

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Start the backend:

```powershell
cd backend
..\.venv\Scripts\python.exe -m uvicorn api:app --host 127.0.0.1 --port 8000
```

Open:

- Health check: `http://127.0.0.1:8000/health`
- Swagger docs: `http://127.0.0.1:8000/docs`

On first startup, the backend downloads:

- `backend/medical_vector_db.faiss`
- `backend/medical_rag_dataset.json`

These files are intentionally ignored by Git because they are generated/downloaded local assets.

## 3. Frontend Setup

From the repository root:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 8080
```

Open:

```text
http://127.0.0.1:8080
```

PowerShell may block the `npm` script shim on some systems. Use `npm.cmd` if that happens.

## 4. Environment Files

Create or edit `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Create `backend/.env` if you want backend Supabase writes:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CORS_ALLOW_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

## 5. Supabase Table

Use this SQL for chat history:

```sql
create extension if not exists "uuid-ossp";

create table if not exists chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id text,
  query text,
  response text,
  created_at timestamp default now()
);
```

## 6. Useful API Checks

Health:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

Monitoring summary:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://127.0.0.1:8000/monitoring/summary `
  -ContentType 'application/json' `
  -Body '{"age":55,"systolic_bp":160,"diastolic_bp":95,"heart_rate":92,"temperature_c":37.1,"glucose_mg_dl":112,"oxygen_saturation":97}'
```

Chat:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://127.0.0.1:8000/ask `
  -ContentType 'application/json' `
  -Body '{"query":"bp 160","role":"user"}'
```

## 7. Troubleshooting

- If `npm` fails in PowerShell, use `npm.cmd`.
- If backend logs show Hugging Face symlink warnings on Windows, the app can still run.
- If first chat response is slow, wait for model warmup and retry.
- If Supabase login fails, check `frontend/.env`.
- If `/ask` fails, confirm the backend downloaded the FAISS and dataset files.
