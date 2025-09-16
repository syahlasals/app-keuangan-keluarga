'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useDataRefresh } from '@/hooks/useDataRefresh';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrency } from '@/utils/helpers';
import { TrendingUp, TrendingDown, Wallet, Plus, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import MonthlyChart from '@/components/MonthlyChart';

export default function DashboardPage() {
  const { user, initialized } = useAuthStore();
  const {
    transactions,
    fetchTransactions,
    getMonthlyStats,
    getCurrentBalance,
    getDailyData
  } = useTransactionStore();
  const {
    categories,
    fetchCategories,
    ensureCategoriesLoaded
  } = useCategoryStore();

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  // Auto-refresh data when page becomes visible
  useDataRefresh();

  useEffect(() => {
    if (user && initialized) {
      console.log('Dashboard: fetching data for user', user.id);
      fetchTransactions();
      ensureCategoriesLoaded(user.id);
    }
  }, [user, initialized, fetchTransactions, ensureCategoriesLoaded]);

  // Force refresh categories if they don't load
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;

    if (user && initialized && categories.length === 0) {
      retryTimeout = setTimeout(() => {
        console.log('Dashboard: forcing category refresh');
        fetchCategories();
      }, 3000);
    }

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [user, initialized, categories.length, fetchCategories]);

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(!isBalanceHidden);
  };

  const monthlyStats = getMonthlyStats();
  const currentBalance = getCurrentBalance();
  const chartData = getDailyData();

  // Function to format hidden balance
  const formatHiddenBalance = (amount: number) => {
    // Convert to string and replace each digit with a dot
    return '•'.repeat(Math.max(4, amount.toString().length));
  };

  const recentTransactions = transactions.slice(0, 5);

  // Function to get the display name for a transaction
  const getTransactionDisplayName = (transaction: any) => {
    // For income transactions, show "Pemasukan" instead of "Tanpa Kategori"
    if (transaction.tipe === 'pemasukan') {
      return 'Pemasukan';
    }

    // For expenses, show category name if available, otherwise "Tanpa Kategori"
    if (!transaction.kategori_id) return 'Tanpa Kategori';
    const category = categories.find(c => c.id === transaction.kategori_id);
    return category?.nama || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-background-500 pb-20 md:pb-8">
      {/* Header */}
      <div className="gradient-header px-4 py-4">
        <div className="safe-top px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Selamat Datang!</h1>
              <p className="text-primary-100 text-sm">{user?.email}</p>
            </div>
            <Link
              href="/transactions/add"
              className="bg-white/20 p-3 rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-md shadow-glass"
            >
              <Plus className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Balance Card */}
        <Card className="mb-6 bg-[#67C090] bg-[linear-gradient(40deg,rgba(129,222,172,1)_0%,rgba(221,244,231,1)_35%,rgba(103,192,144,1)_100%)] border-none shadow-glass-xl glass-card glass-card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-text-900 flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-accent-500" />
              Saldo Saat Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-4xl font-bold text-text-900">
                {isBalanceHidden ? formatHiddenBalance(currentBalance) : formatCurrency(currentBalance)}
              </div>
              <button
                onClick={toggleBalanceVisibility}
                className="ml-2 p-2 rounded-full bg-white/30 hover:bg-white/40 transition-colors"
                aria-label={isBalanceHidden ? "Tampilkan saldo" : "Sembunyikan saldo"}
              >
                {isBalanceHidden ? <EyeOff className="h-5 w-5 text-text-900" /> : <Eye className="h-5 w-5 text-text-900" />}
              </button>
            </div>
            <p className="text-sm text-text-600">
              Total {transactions.length} transaksi
            </p>
          </CardContent>
        </Card>

        {/* Monthly Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-accent-200/50 card-hover glass-card glass-card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-accent-500 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Pemasukan Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-accent-600">
                {formatCurrency(monthlyStats.income)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-danger-200/50 card-hover glass-card glass-card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-danger-600 flex items-center">
                <TrendingDown className="h-4 w-4 mr-1" />
                Pengeluaran Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-danger-700">
                {formatCurrency(monthlyStats.expense)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="mb-6 card-hover glass-card glass-card-hover">
          <CardHeader>
            <CardTitle className="text-lg">Grafik Transaksi Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={chartData} type="line" />
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="mb-6 card-hover glass-card glass-card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
            <Link
              href="/transactions"
              className="text-primary-500 text-sm font-medium hover:text-primary-600 transition-colors"
            >
              Lihat Semua
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-500 mb-4">Belum ada transaksi</p>
                <Link
                  href="/transactions/add"
                  className="inline-flex items-center px-4 py-2.5 bg-primary-500/90 text-white rounded-xl hover:bg-primary-600 transition-all duration-300 shadow-glass backdrop-blur-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Transaksi
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => {
                  const isIncome = transaction.tipe === 'pemasukan';
                  const displayName = getTransactionDisplayName(transaction);

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-white/70 rounded-xl hover:bg-white/80 transition-colors duration-300 backdrop-blur-md shadow-glass"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-text-900">
                            {displayName}
                          </p>
                          <div className={`text-lg font-semibold ${isIncome ? 'text-accent-500' : 'text-danger-600'
                            }`}>
                            {isIncome ? '+' : '-'}{formatCurrency(transaction.nominal)}
                          </div>
                        </div>
                        {transaction.catatan && (
                          <p className="text-sm text-text-600 mt-1">
                            {transaction.catatan}
                          </p>
                        )}
                        <p className="text-xs text-text-500 mt-1">
                          {new Date(transaction.tanggal).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}