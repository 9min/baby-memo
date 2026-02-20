alter table public.activities drop constraint activities_type_check;
alter table public.activities add constraint activities_type_check
  check (type in ('solid_food', 'drink', 'diaper', 'supplement', 'sleep'));
