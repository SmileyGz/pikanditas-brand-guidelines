import { createClient } from '@supabase/supabase-js'

const VITE_SUPABASE_URL = 'https://nggmaelmanlxdpattdid.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZ21hZWxtYW5seGRwYXR0ZGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMzA2ODksImV4cCI6MjA5NzYwNjY4OX0.syf2gYogP6XNL4T9kRfAyt2I0L3ERDzXYck-ycVBI_I';

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function testOtp() {
  console.log("Sending OTP request to +529982317223...");
  const { error: sendError } = await supabase.auth.signInWithOtp({
    phone: '+529982317223'
  });
  console.log("Send OTP Result:", sendError ? sendError.message : "Success");

  console.log("Verifying OTP 123456...");
  const { data, error } = await supabase.auth.verifyOtp({
    phone: '+529982317223',
    token: '123456',
    type: 'sms'
  });

  console.log("Verify Result:", error ? error.message : "Success", data);
}

testOtp().catch(console.error);
