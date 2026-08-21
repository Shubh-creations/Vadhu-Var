import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hyrxnrdvpdwhyuggzcub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cnhucmR2cGR3aHl1Z2d6Y3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzM5MzIsImV4cCI6MjEwMjM0OTkzMn0.O0FkcAClCs3o9e3-4Pm8DtxT-uMzUwMuLr5TIR7Qmmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectAllProfiles() {
  console.log('--- Fetching all profiles from Supabase ---');
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log(`Total profiles found: ${profiles?.length || 0}`);
  for (const p of profiles || []) {
    console.log({
      id: p.id,
      full_name: p.full_name,
      gender: p.gender,
      age: p.age,
      city: p.city,
      state: p.state,
      occupation: p.occupation,
      is_active: p.is_active,
      is_visible: p.is_visible,
      is_id_verified: p.is_id_verified,
      is_fully_verified: p.is_fully_verified,
      photo_url: p.photo_url ? (p.photo_url.substring(0, 40) + '...') : null,
      id_document_url: p.id_document_url ? 'PRESENT' : 'NULL',
      created_at: p.created_at,
      updated_at: p.updated_at
    });
  }

  // Also inspect verification_requests table
  const { data: vReqs, error: vErr } = await supabase
    .from('verification_requests')
    .select('*')
    .order('created_at', { ascending: false });

  console.log(`\nTotal verification requests: ${vReqs?.length || 0}`);
  for (const r of vReqs || []) {
    console.log({
      id: r.id,
      user_id: r.user_id,
      document_type: r.document_type,
      document_url: r.document_url ? 'PRESENT' : 'NULL',
      status: r.status,
      created_at: r.created_at
    });
  }
}

inspectAllProfiles();
