import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hyrxnrdvpdwhyuggzcub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cnhucmR2cGR3aHl1Z2d6Y3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzM5MzIsImV4cCI6MjEwMjM0OTkzMn0.O0FkcAClCs3o9e3-4Pm8DtxT-uMzUwMuLr5TIR7Qmmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanTestProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: false, is_visible: false, full_name: 'Deleted User' })
    .eq('id', '03f712b6-45d5-4b3c-93a0-bddc9958a031');

  console.log('Update result:', { data, error });
}

cleanTestProfiles();
