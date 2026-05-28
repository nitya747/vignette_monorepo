import { createClient } from '@supabase/supabase-js';
import { config } from './src/config/index.js';
import fetch from 'node-fetch';

async function testAuthValidation() {
  console.log('--- Testing live GET /api/history with a real JWT token ---');
  
  const client = createClient(config.supabaseUrl!, config.supabaseServiceKey!);
  
  const email = `test-auth-fetch-${Date.now()}@vignette.ai`;
  const password = 'password123';
  
  console.log('Signing up a test user...');
  const { data: signUpData, error: signUpError } = await client.auth.signUp({
    email,
    password
  });
  
  if (signUpError || !signUpData.session) {
    console.error('SignUp failed:', signUpError?.message || 'No session returned');
    return;
  }
  
  const token = signUpData.session.access_token;
  console.log('SignUp success! Token length:', token.length);
  
  // Try to GET /api/history using this token
  console.log('Fetching GET http://localhost:5000/api/history with Bearer token...');
  try {
    const res = await fetch('http://localhost:5000/api/history', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response Status:', res.status);
    const json = await res.json();
    console.log('Response Body:', JSON.stringify(json, null, 2));
  } catch (err: any) {
    console.error('Fetch failed:', err.message);
  }
}

testAuthValidation();
