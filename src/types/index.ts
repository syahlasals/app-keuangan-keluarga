export interface User {
  id: string;
  email: string;
  nama?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  nama: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  kategori_id: string | null;
  nominal: number;
  tipe: 'pemasukan' | 'pengeluaran';
  tanggal: string;
  catatan: string | null;
  status: 'pending' | 'success';
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface TransactionCreateInput {
  nominal: number;
  tipe: 'pemasukan' | 'pengeluaran';
  tanggal: string;
  kategori_id: string | null;
  catatan: string | null;
}

export interface TransactionUpdateInput extends Partial<TransactionCreateInput> {
  id: string;
}

export interface DashboardStats {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  transactionCount: number;
}

export interface ChartData {
  date: string;
  pemasukan: number;
  pengeluaran: number;
}

export interface FilterOptions {
  kategori_id?: string | null;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}