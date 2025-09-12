import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const disableAuth = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

// Check if we're using placeholder values
const isPlaceholderConfig =
  supabaseUrl.includes('placeholder') ||
  supabaseKey.includes('placeholder') ||
  !supabaseUrl ||
  !supabaseKey;

if (disableAuth) {
  console.warn('🚫 Authentication is disabled for UI testing.');
} else if (isPlaceholderConfig) {
  console.warn('⚠️  Using placeholder Supabase configuration. Authentication will be mocked for development.');
}

// Create a mock client for development when using placeholders
const createMockSupabaseClient = () => {
  return {
    auth: {
      getSession: async () => {
        try {
          return {
            data: { session: null },
            error: null
          };
        } catch (error) {
          console.warn('Mock getSession error:', error);
          return {
            data: { session: null },
            error: null
          };
        }
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        // Mock successful login for demo purposes
        if (email === 'demo@example.com' && password === 'password') {
          return {
            data: {
              user: {
                id: 'mock-user-id',
                email: email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              session: {
                access_token: 'mock-token',
                refresh_token: 'mock-refresh-token',
                user: {
                  id: 'mock-user-id',
                  email: email
                }
              }
            },
            error: null
          };
        }

        return {
          data: { user: null, session: null },
          error: { message: 'Invalid email or password' }
        };
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        return {
          data: {
            user: {
              id: 'mock-user-id',
              email: email,
              created_at: new Date().toISOString()
            },
            session: null
          },
          error: null
        };
      },
      signOut: async () => ({
        error: null
      }),
      resetPasswordForEmail: async () => ({
        error: null
      }),
      onAuthStateChange: () => {
        return {
          data: {
            subscription: {
              unsubscribe: () => { }
            }
          }
        };
      }
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: {
              id: 'mock-user-id',
              email: 'demo@example.com',
              nama: 'Demo User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            error: null
          })
        })
      })
    })
  };
};

// Use mock client for development or real client for production
export const supabase = (isPlaceholderConfig || disableAuth)
  ? createMockSupabaseClient() as any
  : createClient(supabaseUrl, supabaseKey, {
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
    supabaseUrl.includes('placeholder') ||
    supabaseKey.includes('placeholder') ||
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