import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hyrxnrdvpdwhyuggzcub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cnhucmR2cGR3aHl1Z2d6Y3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzM5MzIsImV4cCI6MjEwMjM0OTkzMn0.O0FkcAClCs3o9e3-4Pm8DtxT-uMzUwMuLr5TIR7Qmmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectDocumentsAndStorage() {
  console.log('=== Checking Supabase Storage Buckets ===');
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log('Buckets:', buckets, bErr || '');

  if (buckets) {
    for (const b of buckets) {
      const { data: files, error: fErr } = await supabase.storage.from(b.name).list();
      console.log(`Bucket [${b.name}] files:`, files?.map(f => ({ name: f.name, size: f.metadata?.size })) || fErr);
    }
  }

  console.log('\n=== Checking Profiles for ID Documents ===');
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, id_document_url, photo_url, is_id_verified, is_fully_verified, created_at');

  for (const p of profiles || []) {
    console.log({
      id: p.id,
      full_name: p.full_name,
      has_id_doc: Boolean(p.id_document_url),
      id_doc_preview: p.id_document_url ? p.id_document_url.substring(0, 60) : 'None',
      has_photo: Boolean(p.photo_url),
      is_id_verified: p.is_id_verified,
      created_at: p.created_at
    });
  }

  console.log('\n=== Checking verification_requests ===');
  const { data: vReqs, error: vErr } = await supabase
    .from('verification_requests')
    .select('*');
  console.log('Verification requests:', vReqs || [], vErr || '');
}

inspectDocumentsAndStorage();
