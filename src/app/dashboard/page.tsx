'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrency } from '@/utils/helpers';
import { TrendingUp, TrendingDown, Wallet, Plus } from 'lucide-react';
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
    fetchCategories
  } = useCategoryStore();

  useEffect(() => {
    if (user && initialized) {
      fetchTransactions();
      fetchCategories();
    }
  }, [user, initialized, fetchTransactions, fetchCategories]);

  const monthlyStats = getMonthlyStats();
  const currentBalance = getCurrentBalance();
  const chartData = getDailyData();

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="safe-top px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Selamat Datang!</h1>
              <p className="text-primary-100 text-sm">{user?.email}</p>
            </div>
            <Link
              href="/transactions/add"
              className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors"
            >
              <Plus className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Balance Card */}
        <Card className="mb-6 bg-gradient-to-r from-success-50 to-primary-50 border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-700 flex items-center">
              <Wallet className="h-5 w-5 mr-2" />
              Saldo Saat Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {formatCurrency(currentBalance)}
            </div>
            <p className="text-sm text-gray-600">
              Total {transactions.length} transaksi
            </p>
          </CardContent>
        </Card>

        {/* Monthly Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-success-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-success-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Pemasukan Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-success-700">
                {formatCurrency(monthlyStats.income)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-danger-200">
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Grafik Transaksi Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={chartData} type="line" />
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
            <Link
              href="/transactions"
              className="text-primary-600 text-sm font-medium hover:text-primary-700"
            >
              Lihat Semua
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Belum ada transaksi</p>
                <Link
                  href="/transactions/add"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Transaksi
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => {
                  const category = categories.find(c => c.id === transaction.kategori_id);
                  const isIncome = transaction.tipe === 'pemasukan';

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">
                            {category?.nama || 'Uncategorized'}
                          </p>
                          <div className={`text-lg font-semibold ${isIncome ? 'text-success-600' : 'text-danger-600'
                            }`}>
                            {isIncome ? '+' : '-'}{formatCurrency(transaction.nominal)}
                          </div>
                        </div>
                        {transaction.catatan && (
                          <p className="text-sm text-gray-600 mt-1">
                            {transaction.catatan}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
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