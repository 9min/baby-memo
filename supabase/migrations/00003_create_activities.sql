create table public.activities (
  id uuid default gen_random_uuid() primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  device_id text not null references public.devices(device_id),
  type text not null check (type in ('solid_food', 'drink', 'diaper')),
  recorded_at timestamptz not null,
  memo text,
  metadata jsonb default '{}' not null,
  created_at timestamptz default now() not null
);

alter table public.activities disable row level security;

create index idx_activities_family_recorded on public.activities(family_id, recorded_at desc);

alter publication supabase_realtime add table public.activities;
