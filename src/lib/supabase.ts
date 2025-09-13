import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const disableAuth = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

// Check if we're using placeholder values
const isPlaceholderConfig =
  (supabaseUrl && supabaseUrl.includes('placeholder')) ||
  (supabaseKey && supabaseKey.includes('placeholder')) ||
  !supabaseUrl ||
  !supabaseKey;

// Only show warning for explicit placeholder usage, not for missing env vars
if (disableAuth) {
  console.warn('🚫 Authentication is disabled for UI testing.');
} else if ((supabaseUrl && supabaseUrl.includes('placeholder')) ||
  (supabaseKey && supabaseKey.includes('placeholder'))) {
  console.warn('⚠️  Using placeholder Supabase configuration. Authentication will be mocked for development.');
}

// Use real Supabase client - removed mock client for development
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

  if (error?.message === 'Invalid login credentials' || error?.message === 'Invalid email or password') {
    return {
      error: 'Invalid email or password. Please try again.',
    };
  }

  if (error?.message?.includes('fetch')) {
    return {
      error: 'Unable to connect to authentication server. Please check your internet connection.',
    };
  }

  return {
    error: error?.message || 'An authentication error occurred',
  };
};

// Helper function to check if we're using mock authentication
export const isMockAuth = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const disableAuth = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

  return disableAuth ||
    (supabaseUrl && supabaseUrl.includes('placeholder')) ||
    (supabaseKey && supabaseKey.includes('placeholder')) ||
    !supabaseUrl ||
    !supabaseKey;
};

// Helper function to handle database errors
export const handleDatabaseError = (error: any) => {
  console.error('Database error:', error);
  return {
    error: error?.message || 'A database error occurred',
  };
};