-- ============================================================
-- Vadhu Var Matrimony Platform - Security Hardened Schema
-- ============================================================

CREATE TYPE diet_type AS ENUM ('veg', 'non-veg', 'eggetarian');
CREATE TYPE marital_status_type AS ENUM ('never_married', 'divorced', 'widowed');
CREATE TYPE family_type_enum AS ENUM ('nuclear', 'joint');
CREATE TYPE interest_status_type AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE verification_status_type AS ENUM ('pending', 'approved', 'rejected');

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    age INT NOT NULL CHECK (age >= 18 AND age <= 80),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    occupation TEXT NULL,
    education_level TEXT NULL,
    annual_income_lpa NUMERIC NULL CHECK (annual_income_lpa >= 0),
    height_cm INT NOT NULL CHECK (height_cm >= 100 AND height_cm <= 230),
    diet diet_type NOT NULL DEFAULT 'veg',
    marital_status marital_status_type NOT NULL DEFAULT 'never_married',
    family_type family_type_enum NOT NULL DEFAULT 'nuclear',
    caste TEXT NULL,
    sub_caste TEXT NULL,
    bio TEXT NULL CHECK (char_length(bio) <= 500),
    photo_url TEXT NULL,
    is_id_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_fully_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_profession_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_date TIMESTAMPTZ NULL,
    video_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Interests Table
CREATE TABLE IF NOT EXISTS public.interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status interest_status_type NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_sender_receiver UNIQUE (sender_id, receiver_id)
);

-- 3. Verification Requests Table (Protected)
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    id_document_url TEXT NOT NULL,
    family_consent_document_url TEXT NULL,
    career_proof_url TEXT NULL,
    status verification_status_type NOT NULL DEFAULT 'pending',
    reviewed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Analytics Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    metadata JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read for verified profiles" ON public.profiles
    FOR SELECT USING (is_id_verified = TRUE OR is_fully_verified = TRUE OR auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "View own sent or received interests" ON public.interests
    FOR SELECT TO authenticated 
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Insert own sent interest" ON public.interests
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view own verification request" ON public.verification_requests
    FOR SELECT TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verification request" ON public.verification_requests
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = user_id);
