import { create } from 'zustand';
import { supabase, handleDatabaseError } from '@/lib/supabase';
import type { Category } from '@/types';
import { useAuthStore } from './authStore';
import { DEFAULT_CATEGORIES } from '@/utils/constants';

interface CategoryState {
  categories: Category[];
  loading: boolean;

  // Actions
  fetchCategories: () => Promise<void>;
  createCategory: (nama: string) => Promise<{ error?: string; data?: Category }>;
  updateCategory: (id: string, nama: string) => Promise<{ error?: string }>;
  deleteCategory: (id: string) => Promise<{ error?: string }>;
  initializeDefaultCategories: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

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

      set({ categories: data || [], loading: false });

      // Initialize default categories if none exist
      if (!data || data.length === 0) {
        await get().initializeDefaultCategories();
      }

    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ loading: false });
    }
  },

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

      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            user_id: user.id,
            nama: nama.trim(),
          } as any,
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        return handleDatabaseError(error);
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
    if (!user) return;

    try {
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

      set({ categories: data || [] });
    } catch (error) {
      console.error('Error initializing default categories:', error);
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
}));