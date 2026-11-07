-- Run this file in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  student_name text not null check (char_length(student_name) between 1 and 100),
  contact text not null check (char_length(contact) between 7 and 30),
  category text not null,
  description text not null check (char_length(description) between 1 and 1000),
  severity text not null check (severity in ('critical','high','medium','low')),
  priority text not null check (priority in ('CRITICAL','HIGH','MEDIUM','LOW')),
  priority_score integer not null check (priority_score between 0 and 100),
  latitude double precision,
  longitude double precision,
  status text not null default 'Open' check (status in ('Open','Assigned','Resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists incidents_priority_created_idx
  on public.incidents (priority_score desc, created_at desc);
create index if not exists incidents_status_idx on public.incidents(status);

-- API routes use the server-side service role key. Never expose that key in NEXT_PUBLIC_* variables.
-- RLS is enabled to prevent direct anonymous access from browsers.
alter table public.incidents enable row level security;
