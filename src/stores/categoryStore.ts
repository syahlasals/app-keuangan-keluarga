import { create } from 'zustand';
import { supabase, handleDatabaseError } from '@/lib/supabase';
import type { Category } from '@/types';
import { useAuthStore } from './authStore';
import { DEFAULT_CATEGORIES } from '@/utils/constants';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  lastFetchTime: number | null;
  initialized: boolean;

  // Actions
  fetchCategories: () => Promise<void>;
  createCategory: (nama: string) => Promise<{ error?: string; data?: Category }>;
  updateCategory: (id: string, nama: string) => Promise<{ error?: string }>;
  deleteCategory: (id: string) => Promise<{ error?: string }>;
  initializeDefaultCategories: () => Promise<void>;
  ensureCategoriesLoaded: (userId: string) => Promise<void>;
  forceInitializeCategories: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  lastFetchTime: null,
  initialized: false,

  fetchCategories: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      console.warn('No user found when fetching categories');
      return;
    }

    try {
      set({ loading: true });

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('nama');

      if (error) {
        console.error('Error fetching categories:', error);
        set({ loading: false });
        return;
      }

      console.log('Categories fetched successfully:', data?.length || 0, 'categories');
      set({
        categories: data || [],
        loading: false,
        lastFetchTime: Date.now(),
        initialized: true
      });

      // Initialize default categories if none exist
      if (!data || data.length === 0) {
        console.log('No categories found, initializing default categories');
        await get().initializeDefaultCategories();
      }

    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ loading: false });
    }
  },

  ensureCategoriesLoaded: async (userId: string) => {
    const state = get();
    const { user } = useAuthStore.getState();

    // Don't refetch if we already have categories or if we fetched recently
    const shouldSkip = state.categories.length > 0 ||
      (state.lastFetchTime && Date.now() - state.lastFetchTime < 30000) || // 30 seconds
      !user ||
      user.id !== userId;

    if (shouldSkip) {
      console.log('Skipping category fetch:', {
        hasCategories: state.categories.length > 0,
        recentFetch: state.lastFetchTime && Date.now() - state.lastFetchTime < 30000,
        userMismatch: !user || user.id !== userId
      });
      return;
    }

    console.log('Ensuring categories are loaded for user:', userId);
    await get().fetchCategories();
  },

  // Ganti fungsi createCategory yang lama dengan yang ini

  createCategory: async (nama: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return { error: 'User not authenticated' };

    try {
      // Check if category already exists
      const state = get();
      const existingCategory = state.categories.find(
        cat => cat.nama.toLowerCase() === nama.toLowerCase()
      );

      if (existingCategory) {
        return { error: 'Kategori sudah ada' };
      }

      // PERBAIKAN:
      // 1. Masukkan sebagai objek tunggal, bukan array.
      // 2. Gunakan .select().single() yang kini menjadi valid.
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          nama: nama.trim(),
        })
        .select()
        .single(); // Sekarang ini aman digunakan

      if (error) {
        console.error('Error creating category:', error);
        return handleDatabaseError(error);
      }

      if (!data) {
        return { error: 'Gagal membuat kategori, data tidak kembali.' };
      }

      // Add to local state
      set({
        categories: [...state.categories, data].sort((a, b) => a.nama.localeCompare(b.nama)),
      });

      return { data };
    } catch (error) {
      console.error('Error creating category:', error);
      return handleDatabaseError(error);
    }
  },

  updateCategory: async (id: string, nama: string) => {
    try {
      // Check if category name already exists (excluding current category)
      const state = get();
      const existingCategory = state.categories.find(
        cat => cat.id !== id && cat.nama.toLowerCase() === nama.toLowerCase()
      );

      if (existingCategory) {
        return { error: 'Kategori sudah ada' };
      }

      const { data, error } = await supabase
        .from('categories')
        .update({ nama: nama.trim() } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        return handleDatabaseError(error);
      }

      // Update local state
      const updatedCategories = state.categories
        .map(cat => (cat.id === id ? data : cat))
        .sort((a, b) => a.nama.localeCompare(b.nama));

      set({ categories: updatedCategories });

      return {};
    } catch (error) {
      console.error('Error updating category:', error);
      return handleDatabaseError(error);
    }
  },

  deleteCategory: async (id: string) => {
    try {
      // First, update all transactions with this category to null (Uncategorized)
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ kategori_id: null } as any)
        .eq('kategori_id', id);

      if (updateError) {
        console.error('Error updating transactions:', updateError);
        return handleDatabaseError(updateError);
      }

      // Then delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        return handleDatabaseError(error);
      }

      // Remove from local state
      const state = get();
      const filteredCategories = state.categories.filter(cat => cat.id !== id);
      set({ categories: filteredCategories });

      return {};
    } catch (error) {
      console.error('Error deleting category:', error);
      return handleDatabaseError(error);
    }
  },

  initializeDefaultCategories: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      console.warn('No user found when initializing default categories');
      return;
    }

    try {
      console.log('Initializing default categories for user:', user.id);

      // First check if categories already exist (race condition protection)
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (existingCategories && existingCategories.length > 0) {
        console.log('Categories already exist, skipping initialization');
        // Refetch to get the actual categories
        await get().fetchCategories();
        return;
      }

      const categoriesToCreate = DEFAULT_CATEGORIES.map(nama => ({
        user_id: user.id,
        nama,
      }));

      const { data, error } = await supabase
        .from('categories')
        .insert(categoriesToCreate as any)
        .select();

      if (error) {
        console.error('Error creating default categories:', error);
        return;
      }

      console.log('Default categories created successfully:', data?.length || 0, 'categories');
      set({
        categories: data || [],
        lastFetchTime: Date.now(),
        initialized: true
      });
    } catch (error) {
      console.error('Error initializing default categories:', error);
    }
  },

  reset: () => {
    set({
      categories: [],
      loading: false,
      lastFetchTime: null,
      initialized: false
    });
  },

  forceInitializeCategories: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      console.warn('No user found when force initializing categories');
      return;
    }

    try {
      console.log('Force initializing categories for user:', user.id);

      const categoriesToCreate = DEFAULT_CATEGORIES.map(nama => ({
        user_id: user.id,
        nama,
      }));

      const { data, error } = await supabase
        .from('categories')
        .insert(categoriesToCreate as any)
        .select();

      if (error) {
        console.error('Error force creating categories:', error);
        // If insertion fails, maybe categories already exist, so fetch them
        await get().fetchCategories();
        return;
      }

      console.log('Categories force created successfully:', data?.length || 0, 'categories');
      set({
        categories: data || [],
        lastFetchTime: Date.now(),
        initialized: true
      });
    } catch (error) {
      console.error('Error force initializing categories:', error);
      // Fallback to fetching existing categories
      await get().fetchCategories();
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
}));