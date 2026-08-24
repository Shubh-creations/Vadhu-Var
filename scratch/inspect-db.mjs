import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hyrxnrdvpdwhyuggzcub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cnhucmR2cGR3aHl1Z2d6Y3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzM5MzIsImV4cCI6MjEwMjM0OTkzMn0.O0FkcAClCs3o9e3-4Pm8DtxT-uMzUwMuLr5TIR7Qmmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectDatabaseAndStorage() {
  console.log('--- 1. Fetching all rows from profiles table ---');
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  console.log(`Found ${profiles?.length || 0} profiles. Error:`, pErr);
  if (profiles) {
    profiles.forEach(p => {
      console.log(`ID: ${p.id} | Name: "${p.full_name}" | Gender: ${p.gender} | Active: ${p.is_active} | Visible: ${p.is_visible} | PhotoURL: ${p.photo_url ? p.photo_url.substring(0, 50) + '...' : 'NULL'} | CreatedAt: ${p.created_at}`);
    });
  }

  console.log('\n--- 2. Fetching verification_requests table ---');
  const { data: verifs, error: vErr } = await supabase
    .from('verification_requests')
    .select('*')
    .order('created_at', { ascending: false });

  console.log(`Found ${verifs?.length || 0} verification requests. Error:`, vErr);
  if (verifs) {
    verifs.forEach(v => {
      console.log(`Verif ID: ${v.id} | Profile ID: ${v.profile_id} | Status: ${v.status} | DocURL: ${v.id_document_url ? v.id_document_url.substring(0, 50) + '...' : 'NULL'}`);
    });
  }

  console.log('\n--- 3. Checking Storage Buckets ---');
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log('Buckets:', buckets, 'Error:', bErr);
}

inspectDatabaseAndStorage();
