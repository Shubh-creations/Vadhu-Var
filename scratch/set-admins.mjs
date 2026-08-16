import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hyrxnrdvpdwhyuggzcub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cnhucmR2cGR3aHl1Z2d6Y3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzM5MzIsImV4cCI6MjEwMjM0OTkzMn0.O0FkcAClCs3o9e3-4Pm8DtxT-uMzUwMuLr5TIR7Qmmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const adminUIDs = [
  '7505771e-35af-4b12-818a-d2e0396a096f',
  '277135f2-36c1-4baf-a4c5-a0c850c16500'
];

async function checkAndSetAdmins() {
  console.log('Checking profiles for Admin UIDs in Supabase...');

  for (const uid of adminUIDs) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, is_admin, is_id_verified, is_fully_verified')
      .eq('id', uid)
      .single();

    if (error) {
      console.log(`• UID ${uid}: Profile row not found or error (${error.message}). Will be granted admin automatically upon login via AuthContext!`);
    } else {
      console.log(`• UID ${uid} (${data?.full_name}): Profile found! is_admin = ${data?.is_admin}`);
    }
  }
}

checkAndSetAdmins();
