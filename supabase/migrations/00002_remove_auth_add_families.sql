-- Drop profiles trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop profiles table
drop table if exists public.profiles;

-- Create families table
create table public.families (
  id uuid default gen_random_uuid() primary key,
  code text not null unique
    check (char_length(code) between 6 and 8)
    check (code ~ '^[A-Z0-9]+$'),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create devices table
create table public.devices (
  id uuid default gen_random_uuid() primary key,
  device_id text not null unique,
  family_id uuid not null references public.families(id) on delete cascade,
  nickname text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Disable RLS (MVP simplification)
alter table public.families disable row level security;
alter table public.devices disable row level security;

-- Index for looking up devices by family
create index idx_devices_family_id on public.devices(family_id);
