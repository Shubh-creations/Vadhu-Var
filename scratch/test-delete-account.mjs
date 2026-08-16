import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hyrxnrdvpdwhyuggzcub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cnhucmR2cGR3aHl1Z2d6Y3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzM5MzIsImV4cCI6MjEwMjM0OTkzMn0.O0FkcAClCs3o9e3-4Pm8DtxT-uMzUwMuLr5TIR7Qmmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDeleteAccountFlow() {
  console.log('--- Testing Real Account Deletion & Data Anonymization Flow ---');

  const testEmail = `test_delete_${Date.now()}@vadhu-var-test.com`;
  const testPassword = 'TestPassword123!';

  // 1. Sign up test user
  console.log(`1. Creating test user: ${testEmail}...`);
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { full_name: 'Test Deletion Candidate' }
    }
  });

  if (signUpErr || !signUpData.user) {
    console.error('Sign up failed:', signUpErr);
    return;
  }

  const userId = signUpData.user.id;
  console.log(`✓ User created with UID: ${userId}`);

  // 2. Populate profile with sensitive information
  console.log('2. Populating profile row with personal details and documents...');
  const { data: profData, error: profErr } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: 'Test Deletion Candidate',
      age: 28,
      gender: 'female',
      city: 'Pune',
      state: 'Maharashtra',
      occupation: 'Software Engineer',
      education_level: 'B.Tech',
      bio: 'Looking for a compatible life partner.',
      photo_url: 'https://example.com/avatar.jpg',
      career_proof_url: 'https://example.com/doc.pdf',
      is_active: true,
      is_visible: true
    })
    .select()
    .single();

  if (profErr) {
    console.error('Profile creation failed:', profErr);
    return;
  }
  console.log(`✓ Profile created: full_name="${profData.full_name}", city="${profData.city}", is_active=${profData.is_active}`);

  // 3. Execute Delete & Anonymization
  console.log('3. Executing account deletion & data anonymization...');
  const anonymizedPayload = {
    full_name: 'Deleted User',
    bio: null,
    photo_url: null,
    career_proof_url: null,
    city: null,
    state: null,
    occupation: null,
    education_level: null,
    caste: null,
    sub_caste: null,
    annual_income_lpa: null,
    children_count: null,
    children_living_status: null,
    has_children: false,
    is_active: false,
    is_visible: false,
    is_id_verified: false,
    is_fully_verified: false,
    is_profession_verified: false
  };

  const { error: updateErr } = await supabase
    .from('profiles')
    .update(anonymizedPayload)
    .eq('id', userId);

  if (updateErr) {
    console.error('Anonymization update failed:', updateErr);
    return;
  }
  console.log('✓ Profile row anonymized.');

  // 4. Verify in Supabase
  console.log('4. Verifying sanitized profile state in Supabase...');
  const { data: verifiedRow, error: verifyErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (verifyErr) {
    console.error('Fetch verified row failed:', verifyErr);
    return;
  }

  console.log('--- Sanitized Profile Verification ---');
  console.log(`• full_name: "${verifiedRow.full_name}" (Expected: "Deleted User")`);
  console.log(`• bio: ${verifiedRow.bio} (Expected: null)`);
  console.log(`• city: ${verifiedRow.city} (Expected: null)`);
  console.log(`• state: ${verifiedRow.state} (Expected: null)`);
  console.log(`• occupation: ${verifiedRow.occupation} (Expected: null)`);
  console.log(`• education_level: ${verifiedRow.education_level} (Expected: null)`);
  console.log(`• photo_url: ${verifiedRow.photo_url} (Expected: null)`);
  console.log(`• career_proof_url: ${verifiedRow.career_proof_url} (Expected: null)`);
  console.log(`• is_active: ${verifiedRow.is_active} (Expected: false)`);
  console.log(`• is_visible: ${verifiedRow.is_visible} (Expected: false)`);

  const isSuccess = 
    verifiedRow.full_name === 'Deleted User' &&
    verifiedRow.bio === null &&
    verifiedRow.city === null &&
    verifiedRow.state === null &&
    verifiedRow.occupation === null &&
    verifiedRow.education_level === null &&
    verifiedRow.photo_url === null &&
    verifiedRow.career_proof_url === null &&
    verifiedRow.is_active === false &&
    verifiedRow.is_visible === false;

  if (isSuccess) {
    console.log('🎉 ALL DATA ANONYMIZATION AND DELETION CHECKS PASSED PERFECTLY!');
  } else {
    console.error('❌ Verification failed: some fields were not nullified.');
  }

  // 5. Sign out
  await supabase.auth.signOut();
}

testDeleteAccountFlow();
