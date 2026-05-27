-- Clerk-compatible Supabase data schema.
-- Authentication is verified by FastAPI with Clerk JWTs. The backend uses the
-- Supabase service role key for database access, so these tables are not tied
-- to Supabase Auth users.

create extension if not exists "uuid-ossp";

-- =========================
-- PROFILES TABLE
-- =========================

create table if not exists profiles (
  id text primary key,
  name text,
  phone text,
  created_at timestamptz not null default now()
);

-- =========================
-- CHAT HISTORY TABLE
-- =========================

create table if not exists chat_history (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  query text not null,
  response text not null,
  role text,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_history_user_created
on chat_history (user_id, created_at desc);

-- RLS is intentionally disabled for this backend-owned data path. The FastAPI
-- service verifies Clerk JWTs and accesses Supabase with the service role key.
alter table profiles disable row level security;
alter table chat_history disable row level security;
