import { create } from 'zustand';
import { supabase, handleDatabaseError } from '@/lib/supabase';
import type { Transaction, TransactionCreateInput, TransactionUpdateInput, FilterOptions } from '@/types';
import { useAuthStore } from './authStore';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  hasMore: boolean;
  currentPage: number;

  // Actions
  fetchTransactions: (reset?: boolean) => Promise<void>;
  createTransaction: (transaction: TransactionCreateInput) => Promise<{ error?: string }>;
  updateTransaction: (transaction: TransactionUpdateInput) => Promise<{ error?: string }>;
  deleteTransaction: (id: string) => Promise<{ error?: string }>;
  setLoading: (loading: boolean) => void;

  // Helper methods
  getCurrentBalance: () => number;
  getMonthlyStats: (date?: Date) => { income: number; expense: number; balance: number };
  getDailyData: (date?: Date) => Array<{ date: string; pemasukan: number; pengeluaran: number }>;
}

const PAGE_SIZE = 20;

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  hasMore: true,
  currentPage: 0,

  fetchTransactions: async (reset = false) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const state = get();
      const page = reset ? 0 : state.currentPage;

      let query = supabase
        .from('transactions')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .order('tanggal', { ascending: false })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      const newTransactions = data || [];
      const hasMore = newTransactions.length === PAGE_SIZE;

      set({
        transactions: reset ? newTransactions : [...state.transactions, ...newTransactions],
        hasMore,
        currentPage: page + 1,
      });

    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  },

  createTransaction: async (transactionData: TransactionCreateInput) => {
    const { user } = useAuthStore.getState();
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...transactionData,
            user_id: user.id,
            status: 'success' as const,
          } as any,
        ])
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        return handleDatabaseError(error);
      }

      // Add to local state
      const state = get();
      set({
        transactions: [data, ...state.transactions],
      });

      // Background refresh to ensure synchronization
      setTimeout(() => get().fetchTransactions(true), 100);

      return {};
    } catch (error) {
      console.error('Error creating transaction:', error);
      return handleDatabaseError(error);
    }
  },

  updateTransaction: async (transactionData: TransactionUpdateInput) => {
    try {
      const { id, ...updateData } = transactionData;

      const { data, error } = await supabase
        .from('transactions')
        .update(updateData as any)
        .eq('id', id)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        return handleDatabaseError(error);
      }

      // Update local state
      const state = get();
      const updatedTransactions = state.transactions.map(transaction =>
        transaction.id === id ? data : transaction
      );

      set({ transactions: updatedTransactions });

      // Background refresh to ensure synchronization
      setTimeout(() => get().fetchTransactions(true), 100);

      return {};
    } catch (error) {
      console.error('Error updating transaction:', error);
      return handleDatabaseError(error);
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting transaction:', error);
        return handleDatabaseError(error);
      }

      // Remove from local state
      const state = get();
      const filteredTransactions = state.transactions.filter(
        transaction => transaction.id !== id
      );

      set({ transactions: filteredTransactions });

      // Background refresh to ensure synchronization
      setTimeout(() => get().fetchTransactions(true), 100);

      return {};
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return handleDatabaseError(error);
    }
  },

  setLoading: (loading: boolean) => set({ loading }),

  // Helper methods
  getCurrentBalance: () => {
    const { transactions } = get();
    return transactions.reduce((balance, transaction) => {
      if (transaction.status !== 'success') return balance;

      if (transaction.tipe === 'pemasukan') {
        return balance + transaction.nominal;
      } else {
        return balance - transaction.nominal;
      }
    }, 0);
  },

  getMonthlyStats: (date = new Date()) => {
    const { transactions } = get();
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthlyTransactions = transactions.filter(transaction => {
      if (transaction.status !== 'success') return false;

      const transactionDate = new Date(transaction.tanggal);
      return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
    });

    const income = monthlyTransactions
      .filter(t => t.tipe === 'pemasukan')
      .reduce((sum, t) => sum + t.nominal, 0);

    const expense = monthlyTransactions
      .filter(t => t.tipe === 'pengeluaran')
      .reduce((sum, t) => sum + t.nominal, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  },

  getDailyData: (date = new Date()) => {
    const { transactions } = get();
    const year = date.getFullYear();
    const month = date.getMonth();

    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyData: Record<string, { pemasukan: number; pengeluaran: number }> = {};

    // Initialize all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dailyData[dateStr] = { pemasukan: 0, pengeluaran: 0 };
    }

    // Aggregate transactions by day
    transactions.forEach(transaction => {
      if (transaction.status !== 'success') return;

      const transactionDate = new Date(transaction.tanggal);
      if (transactionDate.getFullYear() === year && transactionDate.getMonth() === month) {
        const dateStr = transaction.tanggal;
        if (dailyData[dateStr]) {
          if (transaction.tipe === 'pemasukan') {
            dailyData[dateStr].pemasukan += transaction.nominal;
          } else {
            dailyData[dateStr].pengeluaran += transaction.nominal;
          }
        }
      }
    });

    // Convert to array format
    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        pemasukan: data.pemasukan,
        pengeluaran: data.pengeluaran,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
}));