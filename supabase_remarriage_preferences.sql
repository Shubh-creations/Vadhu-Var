-- ==============================================================================
-- Vadhu Var: Partner Preferences, Remarriage & Account Settings Migration
-- ==============================================================================

-- 1. Expand Marital Status constraint on profiles table
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_marital_status_check;

ALTER TABLE profiles 
  ADD CONSTRAINT profiles_marital_status_check 
  CHECK (marital_status IN ('never_married', 'divorced', 'widowed', 'awaiting_divorce'));

-- 2. Add Children / Dependents & Account Settings columns to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS has_children VARCHAR(10) DEFAULT 'no',
  ADD COLUMN IF NOT EXISTS children_count NUMERIC,
  ADD COLUMN IF NOT EXISTS children_living_status VARCHAR(50) DEFAULT 'living_together',
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 3. Create partner_preferences table
CREATE TABLE IF NOT EXISTS partner_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age_min NUMERIC DEFAULT 21,
  age_max NUMERIC DEFAULT 35,
  height_min_cm NUMERIC DEFAULT 150,
  height_max_cm NUMERIC DEFAULT 190,
  accepted_marital_statuses TEXT[] DEFAULT ARRAY['never_married', 'divorced', 'widowed', 'awaiting_divorce'],
  diet VARCHAR(50) DEFAULT 'any',
  min_income_lpa VARCHAR(50) DEFAULT 'all',
  state VARCHAR(100) DEFAULT 'any',
  city VARCHAR(100) DEFAULT '',
  education VARCHAR(100) DEFAULT 'any',
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) on partner_preferences
ALTER TABLE partner_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own partner preferences"
ON partner_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own partner preferences"
ON partner_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own partner preferences"
ON partner_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
