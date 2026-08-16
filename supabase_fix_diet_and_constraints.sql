-- ==============================================================================
-- Vadhu Var: Fix "profiles_diet_check" and other check constraints
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Drop restrictive check constraints on profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_diet_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_marital_status_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_family_type_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_gender_check;

-- 2. Ensure columns are flexible VARCHAR / TEXT types
ALTER TABLE public.profiles ALTER COLUMN diet TYPE VARCHAR(50);
ALTER TABLE public.profiles ALTER COLUMN marital_status TYPE VARCHAR(50);
ALTER TABLE public.profiles ALTER COLUMN family_type TYPE VARCHAR(50);
ALTER TABLE public.profiles ALTER COLUMN gender TYPE VARCHAR(50);

-- 3. Set standard defaults
ALTER TABLE public.profiles ALTER COLUMN diet SET DEFAULT 'veg';
ALTER TABLE public.profiles ALTER COLUMN marital_status SET DEFAULT 'never_married';
ALTER TABLE public.profiles ALTER COLUMN family_type SET DEFAULT 'nuclear';

-- 4. Add comprehensive, flexible check constraints that accept both short & long form values
ALTER TABLE public.profiles ADD CONSTRAINT profiles_diet_check 
CHECK (
  diet IS NULL OR 
  diet IN ('veg', 'non-veg', 'eggetarian', 'vegetarian', 'non-vegetarian', 'vegan', 'jain', 'any', 'Veg', 'Non-Veg', 'Eggetarian')
);

ALTER TABLE public.profiles ADD CONSTRAINT profiles_marital_status_check 
CHECK (
  marital_status IS NULL OR 
  marital_status IN ('never_married', 'divorced', 'widowed', 'awaiting_divorce', 'separated')
);

ALTER TABLE public.profiles ADD CONSTRAINT profiles_family_type_check 
CHECK (
  family_type IS NULL OR 
  family_type IN ('nuclear', 'joint', 'other', 'any')
);

-- 5. Refresh permissions for authenticated and anon roles
GRANT ALL ON TABLE public.profiles TO authenticated, anon;
GRANT ALL ON TABLE public.partner_preferences TO authenticated, anon;
GRANT ALL ON TABLE public.verification_requests TO authenticated, anon;
GRANT ALL ON TABLE public.interests TO authenticated, anon;
