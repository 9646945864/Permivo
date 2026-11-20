-- Run once in Supabase: Dashboard → SQL Editor → paste → Run.
-- The app reaches these tables only from its server routes, using the secret key and the
-- Clerk user id. Row level security is on with no policies, so the public (anon) key can read nothing.

create table if not exists public.permits (
  id          text        not null,
  user_id     text        not null,           -- Clerk user id
  name        text        not null,
  type        text        not null,
  county      text,
  events      jsonb       not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.user_data (
  user_id     text        not null,           -- Clerk user id
  key         text        not null,           -- e.g. 'checklist'
  value       jsonb       not null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.permits   enable row level security;
alter table public.user_data enable row level security;
