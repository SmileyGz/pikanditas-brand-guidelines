import { createClient } from '@supabase/supabase-js'

const VITE_SUPABASE_URL = 'https://nggmaelmanlxdpattdid.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZ21hZWxtYW5seGRwYXR0ZGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMzA2ODksImV4cCI6MjA5NzYwNjY4OX0.syf2gYogP6XNL4T9kRfAyt2I0L3ERDzXYck-ycVBI_I';

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function checkSingle() {
  console.log("Checking .single() for non-existent profile...");
  const start = Date.now();
  const { data, error } = await supabase
    .from('profiles')
    .select('role, tier')
    .eq('id', 'c630c1bc-b7a4-431c-b26e-3b965d45d071')
    .single();
  
  console.log("Elapsed:", Date.now() - start, "ms");
  console.log("Result:", error ? error.message : "Success", data);
}

checkSingle().catch(console.error);
