create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id text primary key,
  name text,
  phone text,
  created_at timestamptz not null default now()
);

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

alter table profiles disable row level security;
alter table chat_history disable row level security;
