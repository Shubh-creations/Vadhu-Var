-- ==============================================================================
-- Vadhu Var: Ensure all Profile columns exist in profiles table
-- ==============================================================================

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS has_children VARCHAR(10) DEFAULT 'no',
  ADD COLUMN IF NOT EXISTS children_count NUMERIC,
  ADD COLUMN IF NOT EXISTS children_living_status VARCHAR(50) DEFAULT 'living_together',
  ADD COLUMN IF NOT EXISTS id_document_url TEXT,
  ADD COLUMN IF NOT EXISTS family_consent_document_url TEXT,
  ADD COLUMN IF NOT EXISTS career_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS caste VARCHAR(100),
  ADD COLUMN IF NOT EXISTS sub_caste VARCHAR(100),
  ADD COLUMN IF NOT EXISTS bio TEXT;
