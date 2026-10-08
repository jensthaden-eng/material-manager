create extension if not exists pgcrypto;

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  name text not null unique,
  login_email text not null unique,
  role text not null default 'employee' check (role in ('employee','admin')),
  active boolean not null default true,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.security_events (
  id bigint generated always as identity primary key,
  employee_id uuid references public.employees(id) on delete set null,
  event_type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.employees enable row level security;
alter table public.security_events enable row level security;

-- Browser clients do not get direct employee-management access. Edge Functions use the secret key server-side.
revoke all on public.employees from anon, authenticated;
revoke all on public.security_events from anon, authenticated;

create index if not exists security_events_created_at_idx on public.security_events(created_at desc);
