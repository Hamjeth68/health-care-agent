# Supabase Integration Flowchart

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React/Vite)                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  User Input                                             │  │
│  │  ↓                                                      │  │
│  │  /ask endpoint (POST)                                   │  │
│  │  {query, role, user_id}                                │  │
│  └──────────────────┬──────────────────────────────────────┘  │
│                     │                                           │
│  Uses:              │                                           │
│  VITE_API_URL       │                                           │
│  VITE_SUPABASE_URL  │                                           │
│  VITE_SUPABASE_ANON_KEY                                         │
└─────────────────────┼───────────────────────────────────────────┘
                      │
                      │ HTTP Request
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Python/FastAPI)                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  POST /ask endpoint                                      │ │
│  │  ↓                                                       │ │
│  │  1. Load medical agent                                   │ │
│  │  2. Generate response                                    │ │
│  │  3. Store in memory                                      │ │
│  │  4. Save to Supabase (if user_id provided)             │ │
│  │  ↓                                                       │ │
│  │  Return response                                         │ │
│  └──────────┬───────────────────────┬──────────────────────┘ │
│             │                       │                        │
│  Uses:      │                       │                        │
│  SUPABASE_URL                       │                        │
│  SUPABASE_SERVICE_ROLE_KEY          │                        │
│  CORS_ALLOW_ORIGINS                 │                        │
└─────────────────────┼─────────────────┼──────────────────────┘
                      │                 │
                      │                 │
          HTTP Response                 │
                      │                 │
                      ↓                 │
        ┌─────────────────────┐        │
        │  Return to Frontend  │        │
        └─────────────────────┘        │
                                        │
                                        │ INSERT
                                        ↓
        ┌──────────────────────────────────────┐
        │   Supabase Database                  │
        │                                      │
        │  Table: chat_history                 │
        │  ├─ id (uuid)                        │
        │  ├─ user_id (text)                   │
        │  ├─ query (text)                     │
        │  ├─ response (text)                  │
        │  └─ created_at (timestamp)           │
        │                                      │
        │  Policies:                           │
        │  ├─ SELECT: own records only         │
        │  ├─ INSERT: own records only         │
        │  └─ DELETE: own records only         │
        └──────────────────────────────────────┘
```

## Setup Flow

```
Start
  │
  ├─→ Create Supabase Project
  │     │
  │     ├─→ Get Project URL
  │     ├─→ Get Anon Key (frontend)
  │     └─→ Get Service Role Key (backend)
  │
  ├─→ Create Database Table
  │     │
  │     ├─→ Run SQL: create chat_history table
  │     ├─→ Run SQL: enable RLS
  │     └─→ Run SQL: create RLS policies
  │
  ├─→ Configure Backend
  │     │
  │     ├─→ Create backend/.env
  │     ├─→ Set SUPABASE_URL
  │     ├─→ Set SUPABASE_SERVICE_ROLE_KEY
  │     └─→ Set CORS_ALLOW_ORIGINS
  │
  ├─→ Configure Frontend
  │     │
  │     ├─→ Create frontend/.env
  │     ├─→ Set VITE_API_URL
  │     ├─→ Set VITE_SUPABASE_URL
  │     └─→ Set VITE_SUPABASE_ANON_KEY
  │
  ├─→ Start Backend
  │     │
  │     └─→ python -m uvicorn api:app
  │
  ├─→ Start Frontend
  │     │
  │     └─→ npm run dev
  │
  ├─→ Test Integration
  │     │
  │     ├─→ Make chat request with user_id
  │     ├─→ Check Supabase for new record
  │     └─→ Verify response
  │
  └─→ Done ✅
```

## Request/Response Flow

```
SCENARIO: User sends a chat query

1. FRONTEND INITIATES
   ┌──────────────────────────────┐
   │ User types query:            │
   │ "What is high BP?"           │
   │                              │
   │ POST /ask                    │
   │ {                            │
   │   query: "What is high BP?", │
   │   role: "user",              │
   │   user_id: "user-123"        │
   │ }                            │
   └──────────────────────────────┘
                │
                │ HTTPS
                ↓

2. BACKEND PROCESSES
   ┌──────────────────────────────┐
   │ Receive request              │
   │ ↓                            │
   │ Validate input               │
   │ ↓                            │
   │ Load medical agent           │
   │ ↓                            │
   │ Generate response            │
   │ ↓                            │
   │ Response: "High BP is..."    │
   │ ↓                            │
   │ Check if user_id exists      │
   │ ↓                            │
   │ YES → Save to Supabase       │
   │ NO  → Skip save              │
   └──────────────────────────────┘
                │
                │ HTTPS + Response
                ↓

3. FRONTEND RECEIVES
   ┌──────────────────────────────┐
   │ Display response             │
   │ "High BP is..."              │
   │                              │
   │ (Chat history saved in DB)   │
   └──────────────────────────────┘
                │
                │ (Optional) Fetch history
                ↓

4. OPTIONAL: FETCH HISTORY
   ┌──────────────────────────────┐
   │ GET /history?user_id=...     │
   │ ↓                            │
   │ Return all chats for user    │
   │ ↓                            │
   │ Display in chat history UI   │
   └──────────────────────────────┘
```

## Data Flow: Chat to Supabase

```
Frontend                 Backend                  Supabase
   │                       │                         │
   │  POST /ask            │                         │
   ├──────────────────────→│                         │
   │  {query, user_id}     │                         │
   │                       │  Process query          │
   │                       │  Generate response      │
   │                       │                         │
   │                       │  INSERT chat_history    │
   │                       ├────────────────────────→│
   │                       │  {user_id, query,       │
   │                       │   response}             │
   │                       │                         │
   │                       │  ✅ Success             │
   │  ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤                         │
   │  Response             │                         │
   │                       │                         │
   │  GET /history         │                         │
   ├──────────────────────→│                         │
   │  user_id              │  SELECT from            │
   │                       │  chat_history WHERE     │
   │                       │  user_id = ?            │
   │                       ├────────────────────────→│
   │                       │                         │
   │                       │  ← ─ ─ ─ ─ ─ ─ ─ ─ ─   │
   │  ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤  All user's chats       │
   │  Array of chats       │                         │
   │                       │                         │
```

## Environment Variable Dependencies

```
FRONTEND (.env)
├─ VITE_API_URL ──────────→ Backend URL
│                            └─ default: http://127.0.0.1:8000
│
├─ VITE_SUPABASE_URL ──────→ Supabase Project
│                            └─ from Settings → API
│
└─ VITE_SUPABASE_ANON_KEY ─→ Public Key
                             └─ from Settings → API → anon public

BACKEND (.env)
├─ SUPABASE_URL ───────────→ Supabase Project
│                            └─ from Settings → API
│
├─ SUPABASE_SERVICE_ROLE_KEY → Secret Key
│                            └─ from Settings → API → service_role
│
└─ CORS_ALLOW_ORIGINS ─────→ Frontend URLs
                             └─ default: http://127.0.0.1:8080, etc.
```

## Security Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                       PUBLIC (Browser)                          │
│  Frontend                                                       │
│  ├─ VITE_SUPABASE_ANON_KEY (visible to all users)             │
│  └─ Cannot access service_role_key                             │
└─────────────────────────────────────────────────────────────────┘
           │
           │ HTTPS (encrypted over network)
           │
┌─────────────────────────────────────────────────────────────────┐
│                       PRIVATE (Server)                          │
│  Backend                                                        │
│  ├─ SUPABASE_SERVICE_ROLE_KEY (secret, server-only)           │
│  ├─ Can bypass RLS (careful!)                                  │
│  └─ User ID extracted from authenticated requests              │
└─────────────────────────────────────────────────────────────────┘
           │
           │ Direct connection
           │
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Database                            │
│                                                                 │
│  RLS Policies:                                                 │
│  ├─ Users can only see their own chat history                 │
│  ├─ Users can only insert their own records                    │
│  └─ Service role can bypass (used by backend)                 │
└─────────────────────────────────────────────────────────────────┘
```

## Common Workflows

### Workflow 1: User Logs In and Chats

```
1. User opens frontend
   └─ Supabase auth checks session

2. User enters chat query
   └─ Frontend sends to backend with user_id

3. Backend processes
   └─ Saves to Supabase

4. Frontend displays response
   └─ User sees chat history from Supabase
```

### Workflow 2: User Without Account

```
1. User opens frontend
   └─ No user_id available

2. User enters chat query
   └─ Frontend sends to backend (no user_id)

3. Backend processes
   └─ Skips saving to Supabase

4. Frontend displays response
   └─ Chat exists only in memory
```

### Workflow 3: Retrieve Chat History

```
1. User logs in
   └─ Frontend has user_id

2. Frontend calls GET /history?user_id=...
   └─ Backend queries Supabase

3. Supabase RLS checks
   └─ Only returns user's own records

4. Frontend displays chat history
   └─ User can continue conversation
```
