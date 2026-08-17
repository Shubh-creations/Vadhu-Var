import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hyrxnrdvpdwhyuggzcub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cnhucmR2cGR3aHl1Z2d6Y3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzM5MzIsImV4cCI6MjEwMjM0OTkzMn0.O0FkcAClCs3o9e3-4Pm8DtxT-uMzUwMuLr5TIR7Qmmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectProfilesData() {
  const { data, error } = await supabase.from('profiles').select('*');
  console.log('Total profiles:', data.length);
  for (const p of data) {
    console.log(`\n--- ${p.full_name} (${p.id}) ---`);
    console.log(`• Photo URL: ${p.photo_url ? (p.photo_url.startsWith('data:') ? 'base64 image' : p.photo_url) : 'NULL/BLANK'}`);
    console.log(`• is_id_verified: ${p.is_id_verified}`);
    console.log(`• is_fully_verified: ${p.is_fully_verified}`);
    console.log(`• is_profession_verified: ${p.is_profession_verified}`);
    console.log(`• is_active: ${p.is_active}, is_visible: ${p.is_visible}`);
    console.log(`• bio: ${p.bio ? 'present' : 'NULL'}, occupation: ${p.occupation}, education: ${p.education_level}`);
  }
}

inspectProfilesData();
