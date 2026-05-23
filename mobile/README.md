# Healthcare Monitor AI Mobile App

Expo React Native app for the AI-Powered Healthcare Monitoring Agent.

## Features

- Secure Supabase email/password auth with native secure token storage.
- Guarded auth and app navigation using React Navigation.
- Vitals monitoring screen connected to `POST /monitoring/summary`.
- AI chat screen connected to `POST /ask`.
- Drug interaction and simple risk tools connected to the existing FastAPI endpoints.
- Profile sync using `/profile`.
- FlatList chat rendering, typed API calls, request timeouts, and mobile-first layout.

## Setup

```powershell
cd mobile
copy .env.example .env
npm install
npm run start
```

Set `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

For a physical phone, replace `127.0.0.1` with the LAN IP address of the machine running the FastAPI backend.

## Backend

Start the API before using monitoring, chat, and tools:

```powershell
cd ..
.\.venv\Scripts\python.exe -m uvicorn backend.api:app --host 0.0.0.0 --port 8000
```
