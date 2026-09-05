-- ============================================================
-- Migration: 20260905_kundali_family_features.sql
-- Description: Adds Vedic Astrological (Kundali), Family Heritage,
--              Dual Showcase Photos, and Privacy Controls to profiles.
-- Safe to execute in Supabase SQL Editor (Idempotent: IF NOT EXISTS)
-- ============================================================

-- 1. Showcase & Dual Photos
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS photo_url_2 TEXT NULL,
ADD COLUMN IF NOT EXISTS secondary_photo_url TEXT NULL;

-- 2. Astrological & Kundali Alignment Fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS rashi TEXT NULL,
ADD COLUMN IF NOT EXISTS nakshatra TEXT NULL,
ADD COLUMN IF NOT EXISTS manglik TEXT NULL,
ADD COLUMN IF NOT EXISTS gana TEXT NULL,
ADD COLUMN IF NOT EXISTS nadi TEXT NULL;

-- 3. Family Heritage & Lineage Fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS father_occupation TEXT NULL,
ADD COLUMN IF NOT EXISTS mother_occupation TEXT NULL,
ADD COLUMN IF NOT EXISTS native_place TEXT NULL,
ADD COLUMN IF NOT EXISTS family_values TEXT NULL DEFAULT 'Moderate';

-- 4. Discovery Privacy & Telemetry Visibility Controls
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_search_visible BOOLEAN NOT NULL DEFAULT TRUE;

-- 5. Performance Indexes for Discovery Deck & Filtering
CREATE INDEX IF NOT EXISTS idx_profiles_rashi ON public.profiles (rashi);
CREATE INDEX IF NOT EXISTS idx_profiles_manglik ON public.profiles (manglik);
CREATE INDEX IF NOT EXISTS idx_profiles_city_gender ON public.profiles (city, gender);
CREATE INDEX IF NOT EXISTS idx_profiles_visibility ON public.profiles (is_visible, is_search_visible);

-- 6. Comments for Documentation
COMMENT ON COLUMN public.profiles.photo_url_2 IS 'Secondary showcase full-length/traditional photo URL';
COMMENT ON COLUMN public.profiles.rashi IS 'Vedic Moon sign (Rashi)';
COMMENT ON COLUMN public.profiles.nakshatra IS 'Vedic birth constellation (Nakshatra)';
COMMENT ON COLUMN public.profiles.manglik IS 'Vedic Mangal Dosha status: yes, no, or anshik';
COMMENT ON COLUMN public.profiles.father_occupation IS 'Father profession or retired status';
COMMENT ON COLUMN public.profiles.mother_occupation IS 'Mother profession or homemaker status';
COMMENT ON COLUMN public.profiles.native_place IS 'Ancestral village or native district in Maharashtra/India';
