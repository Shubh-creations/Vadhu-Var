import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hyrxnrdvpdwhyuggzcub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cnhucmR2cGR3aHl1Z2d6Y3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzM5MzIsImV4cCI6MjEwMjM0OTkzMn0.O0FkcAClCs3o9e3-4Pm8DtxT-uMzUwMuLr5TIR7Qmmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanTestProfiles() {
  console.log('--- Inspecting Profiles in Supabase ---');
  const { data, error } = await supabase.from('profiles').select('id, full_name, is_active, is_visible');
  console.log('All Profiles in DB:', data);

  // Clean out test deletion candidate or deleted user rows
  const testIds = data.filter(p => 
    p.full_name === 'Test Deletion Candidate' || 
    p.full_name === 'Deleted User' || 
    p.full_name?.startsWith('Test') ||
    p.is_active === false
  ).map(p => p.id);

  console.log('Test IDs to delete:', testIds);

  for (const id of testIds) {
    const { error: delErr } = await supabase.from('profiles').delete().eq('id', id);
    console.log(`Deleted profile ${id}:`, delErr || 'Success');
  }
}

cleanTestProfiles();
