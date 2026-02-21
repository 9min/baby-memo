-- Add 'memo' to the activity type check constraint
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_type_check;
ALTER TABLE activities ADD CONSTRAINT activities_type_check
  CHECK (type IN ('solid_food', 'drink', 'supplement', 'diaper', 'sleep', 'memo'));
