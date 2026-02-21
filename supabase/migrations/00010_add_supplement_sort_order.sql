-- Add sort_order column to supplement_presets
ALTER TABLE supplement_presets
  ADD COLUMN sort_order integer DEFAULT 0;

-- Backfill existing rows: assign sort_order based on created_at order per family
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY family_id ORDER BY created_at) - 1 AS rn
  FROM supplement_presets
)
UPDATE supplement_presets
SET sort_order = numbered.rn
FROM numbered
WHERE supplement_presets.id = numbered.id;
