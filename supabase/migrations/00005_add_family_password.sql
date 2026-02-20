-- Add password column to families (4-digit string)
alter table public.families
  add column password text not null default '0000'
  check (password ~ '^\d{4}$');
