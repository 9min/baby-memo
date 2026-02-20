-- Add 'supplement' to activities type check constraint
alter table public.activities drop constraint activities_type_check;
alter table public.activities add constraint activities_type_check
  check (type in ('solid_food', 'drink', 'diaper', 'supplement'));

-- Create supplement_presets table
create table public.supplement_presets (
  id uuid default gen_random_uuid() primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  created_at timestamptz default now() not null
);

alter table public.supplement_presets disable row level security;

create index idx_supplement_presets_family on public.supplement_presets(family_id);

alter publication supabase_realtime add table public.supplement_presets;
