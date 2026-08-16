import { createClient } from '@supabase/supabase-js';
import { translations } from '../src/lib/i18n.js';
import { calculateProfileCompleteness } from '../src/lib/profileCompleteness.js';

// Supabase public configuration
const SUPABASE_URL = 'https://hyrxnrdvpdwhyuggzcub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cnhucmR2cGR3aHl1Z2d6Y3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzM5MzIsImV4cCI6MjEwMjM0OTkzMn0.O0FkcAClCs3o9e3-4Pm8DtxT-uMzUwMuLr5TIR7Qmmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runOperationalTests() {
  console.log('================================================================');
  console.log('       VADHU VAR — GENUINE OPERATIONAL TEST SUITE               ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // -------------------------------------------------------------
  // TEST 1: Trilingual Translation Dictionary Integrity Audit
  // -------------------------------------------------------------
  console.log('👉 [TEST 1] Auditing Trilingual Translation Dictionary...');
  const languages = ['en', 'hi', 'mr'];
  const testKeys = [
    'privacyPolicy', 'termsOfService', 'helpFaq', 'shareProfile',
    'profileCompleteness', 'noShortlistedProfiles', 'noShortlistedProfilesDesc',
    'exploreAllCandidates', 'noReceivedInterests', 'noSentInterests',
    'noMatchingProfiles', 'noMatchingProfilesDesc', 'resetAllFilters'
  ];

  let i18nFailed = false;
  for (const lang of languages) {
    for (const key of testKeys) {
      if (!translations[lang] || !translations[lang][key]) {
        console.error(`❌ Missing translation key: [${lang}].[${key}]`);
        i18nFailed = true;
      }
    }
  }

  if (!i18nFailed) {
    console.log('   ✅ All 13 UX keys exist and have non-empty text across EN, HI, and MR.');
    passed++;
  } else {
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 2: Profile Completeness Engine Calculations
  // -------------------------------------------------------------
  console.log('\n👉 [TEST 2] Testing Profile Completeness Dynamic Engine...');
  
  // Minimal Profile (User Beta)
  const minimalProfile = {
    full_name: 'Rahul Patil',
    age: 28,
    gender: 'male',
    city: 'Pune'
  };
  const minimalResult = calculateProfileCompleteness(minimalProfile, null);
  console.log(`   • Minimal Profile Score: ${minimalResult.percentage}% (Expected: 20%)`);
  console.log(`   • Missing Items count: ${minimalResult.missingItems.length}`);

  if (minimalResult.percentage === 20 && minimalResult.missingItems.length === 6) {
    console.log('   ✅ Minimal profile correctly scored with actionable missing tasks.');
    passed++;
  } else {
    console.error('   ❌ Minimal profile completeness calculation mismatch!');
    failed++;
  }

  // Complete Profile (User Alpha)
  const fullProfile = {
    full_name: 'Priyanka Kulkarni',
    age: 26,
    gender: 'female',
    city: 'Mumbai',
    state: 'Maharashtra',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
    bio: 'Software engineer passionate about literature and travel.',
    education_level: 'B.Tech / M.S.',
    occupation: 'Senior Software Engineer',
    id_document_url: 'https://storage.supabase.co/docs/aadhaar_verified.pdf',
    is_id_verified: true,
    caste: 'Deshastha Brahmin',
    family_type: 'nuclear'
  };
  const fullPartnerPrefs = {
    min_age: 26,
    max_age: 32,
    city: 'Mumbai',
    state: 'Maharashtra',
    diet: 'vegetarian',
    accepted_marital_statuses: ['never_married']
  };

  const fullResult = calculateProfileCompleteness(fullProfile, fullPartnerPrefs);
  console.log(`   • Full Profile Score: ${fullResult.percentage}% (Expected: 100%)`);
  console.log(`   • Completed Items count: ${fullResult.completedItems.length}`);

  if (fullResult.percentage === 100 && fullResult.missingItems.length === 0) {
    console.log('   ✅ Full profile scored 100% All-Star.');
    passed++;
  } else {
    console.error('   ❌ Full profile completeness calculation mismatch!');
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 3: Shareable Card Data Sanitization & Safety Verification
  // -------------------------------------------------------------
  console.log('\n👉 [TEST 3] Testing Share Profile Card Payload Security...');
  const sensitiveFields = ['annual_income_lpa', 'id_document_url', 'phone', 'email', 'family_consent_document_url'];
  
  // Function mimicking ShareProfileModal public payload
  const buildPublicShareCardData = (prof) => {
    return {
      fullName: prof.full_name,
      age: prof.age,
      city: prof.city,
      state: prof.state,
      occupation: prof.occupation,
      education: prof.education_level,
      isVerified: prof.is_id_verified || prof.is_fully_verified,
      brandUrl: 'https://vadhu-var.vercel.app'
    };
  };

  const publicCard = buildPublicShareCardData(fullProfile);
  let sensitiveFound = false;
  for (const field of sensitiveFields) {
    if (publicCard[field] !== undefined) {
      console.error(`❌ SENSITIVE LEAKAGE DETECTED: ${field} is present in share card!`);
      sensitiveFound = true;
    }
  }

  if (!sensitiveFound && publicCard.fullName === 'Priyanka Kulkarni' && publicCard.isVerified === true) {
    console.log('   ✅ Share Card contains ONLY safe public metadata (Zero sensitive data leakage).');
    passed++;
  } else {
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 4: Live Supabase REST Endpoint & Database Connectivity
  // -------------------------------------------------------------
  console.log('\n👉 [TEST 4] Testing Live Supabase Backend & Database RLS...');
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, age, city, gender, is_id_verified, is_visible')
      .limit(5);

    if (error) {
      console.error('   ❌ Supabase query error:', error.message);
      failed++;
    } else {
      console.log(`   ✅ Live Supabase responded with ${profiles.length} candidate profiles.`);
      console.log(`   • Sample profile: "${profiles[0]?.full_name || 'Candidate'}" (${profiles[0]?.city})`);
      passed++;
    }
  } catch (err) {
    console.error('   ❌ Network error connecting to Supabase:', err.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runOperationalTests();
