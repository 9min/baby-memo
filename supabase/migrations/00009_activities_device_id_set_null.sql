-- Allow device_id to be null in activities (for when devices are removed/kicked)
ALTER TABLE public.activities ALTER COLUMN device_id DROP NOT NULL;

-- Replace FK constraint: RESTRICT → ON DELETE SET NULL
ALTER TABLE public.activities DROP CONSTRAINT activities_device_id_fkey;
ALTER TABLE public.activities
  ADD CONSTRAINT activities_device_id_fkey
  FOREIGN KEY (device_id) REFERENCES public.devices(device_id) ON DELETE SET NULL;
