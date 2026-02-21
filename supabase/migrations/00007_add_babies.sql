create table public.babies (
  id uuid default gen_random_uuid() primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  birthdate date not null,
  created_at timestamptz default now() not null
);

alter table public.babies disable row level security;

create index idx_babies_family_id on public.babies(family_id);

alter publication supabase_realtime add table public.babies;
