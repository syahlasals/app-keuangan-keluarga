import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, handleAuthError } from '@/lib/supabase';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; success?: boolean; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      initialized: false,

      initialize: async () => {
        try {
          set({ loading: true });

          // Get initial session
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Error getting session:', error);
            set({ user: null, loading: false, initialized: true });
            return;
          }

          if (session?.user) {
            // Get user profile data
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userError) {
              console.error('Error fetching user data:', userError);
              set({ user: null, loading: false, initialized: true });
              return;
            }

            set({
              user: userData,
              loading: false,
              initialized: true
            });
          } else {
            set({ user: null, loading: false, initialized: true });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              set({ user: userData, loading: false });
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, loading: false });
            }
          });

        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ user: null, loading: false, initialized: true });
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ loading: false });
            return handleAuthError(error);
          }

          if (data.user) {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            set({ user: userData, loading: false });
          }

          return {};
        } catch (error) {
          set({ loading: false });
          return handleAuthError(error);
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          set({ loading: true });

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
            set({ loading: false });
            return handleAuthError(error);
          }

          // Note: User record will be created via database trigger after email confirmation
          // or via RLS policy, so we don't create it manually here

          set({ loading: false });

          // Return success message with instruction to check email
          return {
            success: true,
            message: 'Please check your email and click the confirmation link to complete registration.',
          };
        } catch (error) {
          set({ loading: false });
          return handleAuthError(error);
        }
      },

      signOut: async () => {
        try {
          set({ loading: true });

          const { error } = await supabase.auth.signOut();

          if (error) {
            console.error('Error signing out:', error);
          }

          set({ user: null, loading: false });
        } catch (error) {
          console.error('Error during sign out:', error);
          set({ user: null, loading: false });
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
      setLoading: (loading: boolean) => set({ loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);