# Supabase Setup Guide

This guide walks you through setting up Supabase for the AI-Powered Healthcare Monitoring Agent.

## Prerequisites

- A free [Supabase account](https://supabase.com)
- Your Supabase project URL and API keys

---

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in project details:
   - **Name**: e.g., `healthcare-agent`
   - **Database password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
5. Click **"Create new project"** and wait for setup (2-3 minutes)

---

## Step 2: Get Your API Keys

Once your project is ready:

1. Go to **Settings** → **API** in the left sidebar
2. You'll see:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: For frontend
   - **service_role key**: For backend (KEEP THIS SECRET!)

Save these values — you'll need them in Step 3.

---

## Step 3: Create the Chat History Table

1. In Supabase, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste this SQL:

```sql
create extension if not exists "uuid-ossp";

create table if not exists chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id text,
  query text,
  response text,
  created_at timestamp default now()
);

-- Enable row level security for chat_history
alter table chat_history enable row level security;

-- Policy: Users can view their own chat history
create policy "Users can view their own chat history"
  on chat_history for select
  using (user_id = auth.uid()::text);

-- Policy: Users can insert their own chat history
create policy "Users can insert their own chat history"
  on chat_history for insert
  with check (user_id = auth.uid()::text);
```

4. Click **"Run"**
5. You should see a success message

---

## Step 4: Configure Frontend Environment

1. In the frontend directory, create or edit `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

2. Replace with your actual Supabase values from Step 2

---

## Step 5: Configure Backend Environment

1. In the backend directory, create or edit `.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ALLOW_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173
```

2. Replace with your actual Supabase values from Step 2
3. **NEVER commit this file to Git** — it contains secrets!

---

## Step 6: Enable Authentication (Optional but Recommended)

To add login/signup functionality:

1. In Supabase, go to **Authentication** → **Providers**
2. Enable **Email** provider (enabled by default)
3. Go to **URL Configuration**
4. Set **Site URL** to: `http://127.0.0.1:8080` (local) or your production URL
5. Add **Redirect URLs**:
   - `http://127.0.0.1:8080/**`
   - `http://localhost:8080/**`
   - `http://localhost:5173/**`
   - `http://127.0.0.1:5173/**`

---

## Step 7: Test the Setup

### Test Frontend Connection

From the frontend directory:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 8080
```

Open `http://127.0.0.1:8080` and check:
- No console errors about Supabase
- Frontend loads successfully

### Test Backend Connection

From the backend directory:

```powershell
cd backend
..\.venv\Scripts\python.exe -m uvicorn api:app --host 127.0.0.1 --port 8000
```

Check the startup logs — you should see Supabase client initialized if `.env` is configured correctly.

### Test Chat with Supabase

Make a POST request to the chat endpoint:

```powershell
$body = @{
    query = "what is high blood pressure"
    role = "user"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri http://127.0.0.1:8000/ask `
  -ContentType 'application/json' `
  -Body $body
```

The response should include your query and AI response.

---

## Step 8: Verify Chat History Storage

1. In Supabase, go to **Table Editor**
2. Click on `chat_history` table
3. After making a chat request, you should see a new row with:
   - `id`: Auto-generated UUID
   - `user_id`: Your user ID (if authenticated)
   - `query`: Your question
   - `response`: AI response
   - `created_at`: Timestamp

---

## Troubleshooting

### Frontend can't connect to Supabase
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env`
- Verify values match Supabase dashboard
- Restart dev server after changing `.env`

### Backend shows "Supabase client not initialized"
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env`
- Verify `.env` file is in the `backend/` directory (not root)
- Restart the backend server
- Check that values don't have extra whitespace

### Chat history not saving
- Check RLS policies in Supabase → Table Editor → `chat_history` → RLS
- Ensure `chat_history` table exists with correct schema
- Check backend logs for Supabase errors

### CORS errors when frontend calls backend
- Ensure `CORS_ALLOW_ORIGINS` in `backend/.env` includes your frontend URL
- Default includes `http://127.0.0.1:8080` and `http://127.0.0.1:5173`
- Restart backend after changing CORS settings

---

## Production Deployment

For Vercel/Render deployment:

1. Add environment variables in your deployment platform:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (frontend)
   - `SUPABASE_URL` (backend)
   - `SUPABASE_SERVICE_ROLE_KEY` (backend)

2. Update redirect URLs in Supabase to include production domain

3. Use service role key only for backend operations (never expose to frontend)

---

## Security Best Practices

✅ **DO:**
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret (only in backend `.env`)
- Use `SUPABASE_ANON_KEY` in frontend (it's public)
- Enable RLS policies on all tables
- Rotate keys periodically from Supabase dashboard

❌ **DON'T:**
- Commit `.env` files to Git
- Share service role key publicly
- Expose service role key in frontend code
- Use service role key for client-side operations

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Python Client](https://github.com/supabase-community/supabase-py)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
