import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper function to handle auth errors
export const handleAuthError = (error: any) => {
  console.error('Auth error:', error);

  // Handle specific auth errors
  if (error?.message === 'Email not confirmed') {
    return {
      error: 'Please check your email and click the confirmation link before signing in.',
    };
  }

  if (error?.message === 'Invalid login credentials') {
    return {
      error: 'Invalid email or password. Please try again.',
    };
  }

  return {
    error: error?.message || 'An authentication error occurred',
  };
};

// Helper function to handle database errors
export const handleDatabaseError = (error: any) => {
  console.error('Database error:', error);
  return {
    error: error?.message || 'A database error occurred',
  };
};