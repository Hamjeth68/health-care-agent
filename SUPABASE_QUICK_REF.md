# Supabase Quick Reference

## 🚀 Quick Start Checklist

- [ ] Create Supabase project at [app.supabase.com](https://app.supabase.com)
- [ ] Copy API keys (Project URL, Anon Key, Service Role Key)
- [ ] Create chat_history table via SQL Editor (see SUPABASE_SETUP.md Step 3)
- [ ] Create `backend/.env` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Create `frontend/.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Run backend: `cd backend && python -m uvicorn api:app --host 127.0.0.1 --port 8000`
- [ ] Run frontend: `cd frontend && npm run dev -- --host 127.0.0.1 --port 8080`

## 📝 Environment Variables

### Backend (`backend/.env`)
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
CORS_ALLOW_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## 🔑 Where to Find Your Keys

In Supabase Dashboard:
1. **Settings** → **API**
   - `Project URL`: Copy here
   - `anon public`: Copy to frontend
   - `service_role secret`: Copy to backend (KEEP SECRET!)

## 🗄️ Database Schema

### chat_history table
```sql
id              uuid (primary key)
user_id         text
query           text
response        text
created_at      timestamp
```

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/ask` | Send query, save to Supabase if user_id provided |
| GET | `/history?user_id=xyz` | Fetch chat history from Supabase |
| DELETE | `/clear?user_id=xyz` | Clear user's chat history |
| POST | `/monitoring/summary` | Get vitals monitoring alerts |
| GET | `/health` | Health check |

## 📤 Example: Save Chat to Supabase

```javascript
// Frontend
const response = await fetch('http://127.0.0.1:8000/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "What is high blood pressure?",
    role: "user",
    user_id: "authenticated-user-id"  // Required to save
  })
});
```

## 🔐 Security Notes

- ✅ Anon key is safe in frontend (public)
- ✅ Service role key stays in backend only
- ✅ RLS policies restrict user access to own data
- ❌ Never commit `.env` files
- ❌ Never expose service role key

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| "Supabase client not initialized" | Check `backend/.env` path and values |
| Chat not saving | Ensure `user_id` is provided in request |
| CORS errors | Update `CORS_ALLOW_ORIGINS` in `backend/.env` |
| Frontend can't connect | Restart dev server after changing `frontend/.env` |

## 🔗 Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Python SDK](https://github.com/supabase-community/supabase-py)
- [Supabase JS SDK](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 💡 Pro Tips

1. **Test locally first** before deploying to production
2. **Use RLS policies** to restrict data access by user
3. **Rotate keys periodically** from Supabase dashboard
4. **Monitor usage** in Supabase dashboard to avoid unexpected charges
5. **Use service role key only for backend** operations (authentication bypasses RLS)

---

For detailed setup, see `SUPABASE_SETUP.md`
