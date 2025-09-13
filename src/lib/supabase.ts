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
  global: {
    // Add better error handling
    fetch: async (url, options = {}) => {
      try {
        const response = await fetch(url, options);

        // Log response for debugging
        if (!response.ok) {
          console.warn(`Supabase API request failed: ${response.status} ${response.statusText} - ${url}`);
        }

        return response;
      } catch (error) {
        console.error('Network error in Supabase client:', error);
        throw error;
      }
    }
  }
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

  // Handle database errors specifically
  if (error?.message?.includes('Database error')) {
    return {
      error: 'There was a database error while processing your request. Please try again later.',
    };
  }

  // Handle constraint violations
  if (error?.message?.includes('duplicate key value violates unique constraint')) {
    return {
      error: 'An account with this email already exists. Please try logging in instead.',
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