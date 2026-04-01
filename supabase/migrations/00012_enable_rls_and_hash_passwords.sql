-- Enable pgcrypto for bcrypt password hashing
-- In Supabase, pgcrypto is installed in the 'extensions' schema by default.
create extension if not exists pgcrypto with schema extensions;

-- Drop the 4-digit check constraint so hashed passwords can be stored
alter table public.families drop constraint if exists families_password_check;

-- Drop the plain-text default
alter table public.families alter column password drop default;

-- Hash all existing plain-text passwords (4-digit format)
-- Use schema-qualified names since pgcrypto lives in extensions schema.
update public.families
set password = extensions.crypt(password, extensions.gen_salt('bf'))
where password ~ '^\d{4}$';

-- ── Enable RLS on all public tables ──────────────────────────────────────────

alter table public.families enable row level security;
alter table public.devices enable row level security;
alter table public.activities enable row level security;
alter table public.babies enable row level security;
alter table public.supplement_presets enable row level security;

-- ── Open policies for non-sensitive tables ────────────────────────────────────
-- App accesses these directly with the anon key; family_id filtering is app-level.

create policy "anon_all" on public.activities
  for all to anon using (true) with check (true);

create policy "anon_all" on public.babies
  for all to anon using (true) with check (true);

create policy "anon_all" on public.devices
  for all to anon using (true) with check (true);

create policy "anon_all" on public.supplement_presets
  for all to anon using (true) with check (true);

-- families: no direct anon access — all access goes through security definer functions

-- ── Security definer functions for families ───────────────────────────────────
-- These bypass RLS and run as the function owner (postgres).
-- The password column is never returned to the client.
-- search_path includes extensions so crypt/gen_salt are found.

-- Check if a family exists by code (no password exposed)
create or replace function public.get_family_by_code(p_code text)
returns table(id uuid, code text)
language sql
security definer
set search_path = public, extensions
as $$
  select f.id, f.code
  from public.families f
  where f.code = p_code;
$$;

-- Verify password and return family info; returns 0 rows on mismatch
create or replace function public.verify_family(p_code text, p_password text)
returns table(id uuid, code text)
language sql
security definer
set search_path = public, extensions
as $$
  select f.id, f.code
  from public.families f
  where f.code = p_code
    and crypt(p_password, f.password) = f.password;
$$;

-- Create a new family with a bcrypt-hashed password
create or replace function public.create_family(p_code text, p_password text)
returns table(id uuid, code text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
begin
  insert into public.families(code, password)
  values (p_code, crypt(p_password, gen_salt('bf')))
  returning families.id into v_id;

  return query select v_id, p_code;
end;
$$;

-- Update a family's password (caller must already be authenticated to the family)
create or replace function public.update_family_password(p_family_id uuid, p_new_password text)
returns void
language sql
security definer
set search_path = public, extensions
as $$
  update public.families
  set password = crypt(p_new_password, gen_salt('bf'))
  where id = p_family_id;
$$;

-- Delete a family if the password matches; returns true if deleted, false if not
create or replace function public.delete_family_secure(p_family_id uuid, p_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_count int;
begin
  delete from public.families
  where id = p_family_id
    and crypt(p_password, password) = password;

  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

-- ── Grant execute only to the roles that need it ──────────────────────────────

revoke execute on function public.get_family_by_code(text) from public;
revoke execute on function public.verify_family(text, text) from public;
revoke execute on function public.create_family(text, text) from public;
revoke execute on function public.update_family_password(uuid, text) from public;
revoke execute on function public.delete_family_secure(uuid, text) from public;

grant execute on function public.get_family_by_code(text) to anon, authenticated;
grant execute on function public.verify_family(text, text) to anon, authenticated;
grant execute on function public.create_family(text, text) to anon, authenticated;
grant execute on function public.update_family_password(uuid, text) to anon, authenticated;
grant execute on function public.delete_family_secure(uuid, text) to anon, authenticated;
