-- ==============================================================================
-- Vadhu Var: Fix Postgres "permission denied for table profiles" & RLS
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Grant full table and sequence permissions to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 2. Explicit grants on specific tables
GRANT ALL ON TABLE profiles TO authenticated, anon;
GRANT ALL ON TABLE partner_preferences TO authenticated, anon;
GRANT ALL ON TABLE verification_requests TO authenticated, anon;
GRANT ALL ON TABLE interests TO authenticated, anon;

-- 3. Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Re-create permissive and secure RLS policies for profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Allow public read on profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated to insert/update own profile" ON profiles;

-- Anyone (guests & members) can view active profiles
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
TO anon, authenticated
USING (
  (is_visible IS NOT FALSE) AND 
  (is_active IS NOT FALSE)
);

-- Authenticated users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Authenticated users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Partner preferences RLS
ALTER TABLE partner_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow users to view partner preferences" ON partner_preferences;
CREATE POLICY "Allow users to view partner preferences"
ON partner_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to upsert partner preferences" ON partner_preferences;
CREATE POLICY "Allow users to upsert partner preferences"
ON partner_preferences FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Verification requests RLS
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow users to insert verification request" ON verification_requests;
CREATE POLICY "Allow users to insert verification request"
ON verification_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to view own verification request" ON verification_requests;
CREATE POLICY "Allow users to view own verification request"
ON verification_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
