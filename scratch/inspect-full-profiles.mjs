import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hyrxnrdvpdwhyuggzcub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cnhucmR2cGR3aHl1Z2d6Y3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzM5MzIsImV4cCI6MjEwMjM0OTkzMn0.O0FkcAClCs3o9e3-4Pm8DtxT-uMzUwMuLr5TIR7Qmmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectProfilesFull() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_active', true)
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  console.log('Active & Visible profiles count:', data?.length);
  if (data) {
    data.forEach(p => {
      console.log('--- Candidate ---');
      console.log('ID:', p.id);
      console.log('Name:', p.full_name);
      console.log('Gender:', p.gender);
      console.log('Age:', p.age);
      console.log('City:', p.city);
      console.log('Occupation:', p.occupation);
      console.log('Education:', p.education_level);
      console.log('Income:', p.annual_income_lpa);
      console.log('Verified:', p.is_id_verified, p.is_fully_verified);
      console.log('PhotoURL length:', p.photo_url ? p.photo_url.length : 'none');
    });
  }
}

inspectProfilesFull();
