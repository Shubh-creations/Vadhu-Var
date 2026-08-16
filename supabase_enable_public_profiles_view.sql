-- ==============================================================================
-- Vadhu Var: Ensure Completed User Profiles are Visible Across App & Web
-- ==============================================================================

-- 1. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop any restrictive SELECT policies on profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated read on profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- 3. Create permissive SELECT policy so all completed & active profiles are visible to all members and guests
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
TO anon, authenticated
USING (
  (is_visible IS NOT FALSE) AND 
  (is_active IS NOT FALSE)
);

-- 4. Allow users to insert and update their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 5. Ensure all existing profiles have is_active and is_visible set to TRUE
UPDATE profiles 
SET 
  is_active = TRUE,
  is_visible = TRUE
WHERE is_active IS NULL OR is_visible IS NULL;
