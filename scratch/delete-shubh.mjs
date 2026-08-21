import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hyrxnrdvpdwhyuggzcub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cnhucmR2cGR3aHl1Z2d6Y3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzM5MzIsImV4cCI6MjEwMjM0OTkzMn0.O0FkcAClCs3o9e3-4Pm8DtxT-uMzUwMuLr5TIR7Qmmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function deleteShubhProfile() {
  const targetId = 'c56a06d9-449b-4183-8844-fdbaa372e421';
  console.log(`Attempting to delete/deactivate profile ${targetId} (Shubh)...`);

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: 'Deleted User',
      is_active: false,
      is_visible: false,
      photo_url: null,
      bio: null,
      city: null,
      state: null,
      occupation: null
    })
    .eq('id', targetId)
    .select();

  console.log('Result:', { data, error });
}

deleteShubhProfile();
