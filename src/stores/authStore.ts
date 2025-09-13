import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, handleAuthError } from '@/lib/supabase';
import type { User } from '@/types';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; success?: boolean; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      initialized: false,

      initialize: async () => {
        try {
          // Skip authentication if disabled
          if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
            set({
              user: {
                id: 'demo-user-id',
                email: 'demo@example.com',
                nama: 'Demo User',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              initialized: true
            });
            return;
          }

          // Get initial session with error handling for refresh token
          let session = null;
          try {
            const { data: { session: currentSession }, error } = await supabase.auth.getSession();

            if (error) {
              console.warn('Session error (possibly expired refresh token):', error);
              // Clear any stored session and continue as unauthenticated
              await supabase.auth.signOut();
              set({ user: null, initialized: true });
              return;
            }

            session = currentSession;
          } catch (sessionError) {
            console.warn('Failed to get session:', sessionError);
            // Clear stored auth data and continue as unauthenticated
            try {
              await supabase.auth.signOut();
            } catch (signOutError) {
              console.warn('Failed to sign out during session error:', signOutError);
            }
            set({ user: null, initialized: true });
            return;
          }

          if (session?.user) {
            // Try to get user profile data
            try {
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (userError) {
                console.warn('Could not fetch user profile during init:', userError);
                // Fallback to session user data
                set({
                  user: {
                    id: session.user.id,
                    email: session.user.email!,
                    nama: session.user.email!.split('@')[0],
                    created_at: session.user.created_at!,
                    updated_at: session.user.updated_at || session.user.created_at!
                  },
                  initialized: true
                });
              } else {
                set({
                  user: userData,
                  initialized: true
                });
              }
            } catch (profileError) {
              console.warn('Profile fetch failed during init:', profileError);
              set({
                user: {
                  id: session.user.id,
                  email: session.user.email!,
                  nama: session.user.email!.split('@')[0],
                  created_at: session.user.created_at!,
                  updated_at: session.user.updated_at || session.user.created_at!
                },
                initialized: true
              });
            }
          } else {
            set({ user: null, initialized: true });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            if (event === 'SIGNED_IN' && session?.user) {
              try {
                const { data: userData } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();

                set({
                  user: userData || {
                    id: session.user.id,
                    email: session.user.email!,
                    nama: session.user.email!.split('@')[0],
                    created_at: session.user.created_at!,
                    updated_at: session.user.updated_at || session.user.created_at!
                  }
                });
              } catch (error) {
                console.warn('Failed to fetch user profile on auth change:', error);
                set({
                  user: {
                    id: session.user.id,
                    email: session.user.email!,
                    nama: session.user.email!.split('@')[0],
                    created_at: session.user.created_at!,
                    updated_at: session.user.updated_at || session.user.created_at!
                  }
                });
              }
            } else if (event === 'SIGNED_OUT') {
              set({ user: null });
              // Reset other stores when user signs out
              if (typeof window !== 'undefined') {
                // Dynamically import to avoid circular dependency
                import('./categoryStore').then(({ useCategoryStore }) => {
                  useCategoryStore.getState().reset();
                });
              }
            }
          });

        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ user: null, initialized: true });
        }
      },

      signIn: async (email: string, password: string) => {
        try {

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            return handleAuthError(error);
          }

          if (data.user) {
            // Try to get user profile data
            try {
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();

              if (userError) {
                console.warn('Could not fetch user profile, using auth data:', userError);
                // Fallback to auth user data if profile fetch fails
                set({
                  user: {
                    id: data.user.id,
                    email: data.user.email!,
                    nama: data.user.email!.split('@')[0],
                    created_at: data.user.created_at!,
                    updated_at: data.user.updated_at || data.user.created_at!
                  }
                });
              } else {
                set({ user: userData });
              }
            } catch (profileError) {
              console.warn('Profile fetch failed, using basic user data:', profileError);
              // Fallback to basic user data
              set({
                user: {
                  id: data.user.id,
                  email: data.user.email!,
                  nama: data.user.email!.split('@')[0],
                  created_at: data.user.created_at!,
                  updated_at: data.user.updated_at || data.user.created_at!
                }
              });
            }
          }

          return {};
        } catch (error) {
          console.error('SignIn catch block:', error);
          return handleAuthError(error);
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          console.log('Attempting to sign up user:', email);

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/login`,
              data: {
                email,
              },
            },
          });

          if (error) {
            console.error('Supabase auth signUp error:', error);
            return handleAuthError(error);
          }

          console.log('Supabase auth signUp successful:', data);

          // Note: User record will be created via database trigger after email confirmation
          // or via RLS policy, so we don't create it manually here
          // If the trigger fails, we'll handle it gracefully

          // Return success message with instruction to check email
          return {
            success: true,
            message: 'Please check your email and click the confirmation link to complete registration.',
          };
        } catch (error) {
          console.error('Unexpected error during signUp:', error);
          return handleAuthError(error);
        }
      },

      signOut: async () => {
        try {

          const { error } = await supabase.auth.signOut();

          if (error) {
            console.error('Error signing out:', error);
          }

          set({ user: null });
          // Reset other stores when user signs out
          if (typeof window !== 'undefined') {
            // Dynamically import to avoid circular dependency
            import('./categoryStore').then(({ useCategoryStore }) => {
              useCategoryStore.getState().reset();
            });
          }
        } catch (error) {
          console.error('Error during sign out:', error);
          set({ user: null });
          // Reset other stores when user signs out
          if (typeof window !== 'undefined') {
            import('./categoryStore').then(({ useCategoryStore }) => {
              useCategoryStore.getState().reset();
            });
          }
        }
      },

      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });

          if (error) {
            return handleAuthError(error);
          }

          return {};
        } catch (error) {
          return handleAuthError(error);
        }
      },

      setUser: (user: User | null) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);