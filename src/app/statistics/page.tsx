'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Wallet, Calendar, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import MonthlyChart from '@/components/MonthlyChart';
import { Transaction } from '@/types';

export default function StatisticsPage() {
  const { user, initialized } = useAuthStore();
  const {
    transactions,
    fetchTransactions,
    getMonthlyStats,
    getCurrentBalance,
    getDailyData
  } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [comparisonMonth, setComparisonMonth] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (user && initialized) {
      fetchTransactions(true);
      fetchCategories();
    }
  }, [user, initialized, fetchTransactions, fetchCategories]);

  // Get stats based on view mode
  const getStatsForPeriod = (date: Date) => {
    if (viewMode === 'year') {
      // For yearly view, aggregate all months of the selected year
      let totalIncome = 0;
      let totalExpense = 0;

      for (let month = 0; month < 12; month++) {
        const monthDate = new Date(date.getFullYear(), month, 1);
        const monthlyStats = getMonthlyStats(monthDate);
        totalIncome += monthlyStats.income;
        totalExpense += monthlyStats.expense;
      }

      return {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense
      };
    } else {
      // For monthly view, return stats for the selected month
      return getMonthlyStats(date);
    }
  };

  // Get data for chart based on view mode
  const getDataForPeriod = (date: Date) => {
    if (viewMode === 'year') {
      // For yearly view, aggregate monthly data
      const monthlyData = [];
      for (let month = 0; month < 12; month++) {
        const monthDate = new Date(date.getFullYear(), month, 1);
        const monthData = getDailyData(monthDate);

        // Sum up all daily data for the month
        let totalIncome = 0;
        let totalExpense = 0;
        monthData.forEach(day => {
          totalIncome += day.pemasukan;
          totalExpense += day.pengeluaran;
        });

        monthlyData.push({
          date: `${date.getFullYear()}-${String(month + 1).padStart(2, '0')}`,
          pemasukan: totalIncome,
          pengeluaran: totalExpense
        });
      }
      return monthlyData;
    } else {
      // For monthly view, return daily data
      return getDailyData(date);
    }
  };

  const selectedPeriodStats = getStatsForPeriod(selectedMonth);
  const selectedPeriodData = getDataForPeriod(selectedMonth);

  // Get comparison stats
  const getComparisonPeriod = () => {
    if (viewMode === 'year') {
      const comparisonYear = new Date(selectedMonth);
      comparisonYear.setFullYear(comparisonYear.getFullYear() - 1);
      return comparisonYear;
    } else {
      const comparisonMonth = new Date(selectedMonth);
      comparisonMonth.setMonth(comparisonMonth.getMonth() - 1);
      return comparisonMonth;
    }
  };

  const comparisonPeriod = getComparisonPeriod();
  const comparisonPeriodStats = getStatsForPeriod(comparisonPeriod);

  // Calculate growth percentages
  const incomeGrowth = comparisonPeriodStats.income > 0
    ? ((selectedPeriodStats.income - comparisonPeriodStats.income) / comparisonPeriodStats.income) * 100
    : selectedPeriodStats.income > 0 ? 100 : 0;

  const expenseGrowth = comparisonPeriodStats.expense > 0
    ? ((selectedPeriodStats.expense - comparisonPeriodStats.expense) / comparisonPeriodStats.expense) * 100
    : selectedPeriodStats.expense > 0 ? 100 : 0;

  const balanceGrowth = comparisonPeriodStats.balance > 0
    ? ((selectedPeriodStats.balance - comparisonPeriodStats.balance) / comparisonPeriodStats.balance) * 100
    : selectedPeriodStats.balance > 0 ? 100 : 0;

  // Category-based analysis
  const getCategoryStats = () => {
    const categoryStats: Record<string, { name: string; amount: number; count: number }> = {};

    // Initialize with all categories
    categories.forEach(category => {
      categoryStats[category.id] = {
        name: category.nama,
        amount: 0,
        count: 0
      };
    });

    // Add "Tanpa Kategori" for uncategorized expenses
    categoryStats['uncategorized'] = {
      name: 'Tanpa Kategori',
      amount: 0,
      count: 0
    };

    // Add "Pemasukan" for income transactions
    categoryStats['income'] = {
      name: 'Pemasukan',
      amount: 0,
      count: 0
    };

    transactions.forEach(transaction => {
      if (transaction.status !== 'success') return;

      const transactionDate = new Date(transaction.tanggal);

      // Filter based on view mode
      if (viewMode === 'year') {
        // Yearly view: include all transactions from the selected year
        if (transactionDate.getFullYear() !== selectedMonth.getFullYear()) return;
      } else {
        // Monthly view: include transactions from the selected month
        if (transactionDate.getFullYear() !== selectedMonth.getFullYear() ||
          transactionDate.getMonth() !== selectedMonth.getMonth()) return;
      }

      if (transaction.tipe === 'pemasukan') {
        categoryStats['income'].amount += transaction.nominal;
        categoryStats['income'].count += 1;
      } else {
        const categoryId = transaction.kategori_id || 'uncategorized';
        if (categoryStats[categoryId]) {
          categoryStats[categoryId].amount += transaction.nominal;
          categoryStats[categoryId].count += 1;
        }
      }
    });

    return Object.values(categoryStats).filter(stat => stat.amount > 0);
  };

  const categoryStats = getCategoryStats();

  // Format month name for display
  const formatMonthName = (date: Date) => {
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  // Format year for display
  const formatYear = (date: Date) => {
    return `Tahun ${date.getFullYear()}`;
  };

  // Format period for display
  const formatPeriod = (date: Date) => {
    return viewMode === 'year' ? formatYear(date) : formatMonthName(date);
  };

  // Handle month change
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month] = e.target.value.split('-').map(Number);
    const newDate = new Date(year, month - 1);
    setSelectedMonth(newDate);
  };

  // Handle year change
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = Number(e.target.value);
    const newDate = new Date(selectedMonth);
    newDate.setFullYear(year);
    setSelectedMonth(newDate);
    setSelectedYear(year);
  };

  // Handle direct date selection
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setSelectedMonth(newDate);
    }
  };

  // Reset filter to current period
  const resetFilter = () => {
    const now = new Date();
    setSelectedMonth(now);
    setSelectedYear(now.getFullYear());
    setViewMode('month');
  };

  // Generate month options for the last 24 months
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();

    for (let i = 0; i < 24; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = formatMonthName(date);
      options.push({ value, label });
    }

    return options;
  };

  // Generate year options for the last 10 years
  const generateYearOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 10; i++) {
      const year = currentYear - i;
      options.push({ value: year.toString(), label: year.toString() });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();
  const yearOptions = generateYearOptions();

  return (
    <div className="min-h-screen bg-background-500 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white/90 border-b sticky top-0 z-40 shadow-glass backdrop-blur-md rounded-b-3xl">
        <div className="safe-top px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/others" className="mr-4">
              <button className="p-2 text-text-400 hover:text-primary-500 hover:bg-white/70 transition-colors duration-300 rounded-xl disabled:opacity-50 backdrop-blur-md shadow-glass">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <h1 className="text-xl font-semibold text-text-900">Statistik Keuangan</h1>
            <div className="flex items-center space-x-2">
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Enhanced Date Selection */}
        <div className="mb-6">
          {/* Date Picker Toggle */}
          <div className="mb-3 flex space-x-2">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex-1 flex items-center p-3 bg-white/70 border border-white/30 rounded-xl backdrop-blur-md shadow-glass focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Calendar className="h-5 w-5 mr-2 text-text-500" />
              <span className="flex-1 text-left">
                {viewMode === 'month'
                  ? `Bulan: ${formatMonthName(selectedMonth)}`
                  : `Tahun: ${selectedMonth.getFullYear()}`}
              </span>
            </button>
            <Button
              variant="outline"
              onClick={resetFilter}
              className="p-3"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>

          {/* Date Picker Options */}
          {showDatePicker && (
            <div className="bg-white/70 border border-white/30 rounded-lg backdrop-blur-md shadow-glass p-4 mt-2">
              {/* View Mode Toggle */}
              <div className="flex mb-4">
                <button
                  onClick={() => setViewMode('month')}
                  className={`flex-1 py-2 rounded-l-lg ${viewMode === 'month' ? 'bg-primary-500 text-white' : 'bg-white/50'}`}
                >
                  Bulan
                </button>
                <button
                  onClick={() => setViewMode('year')}
                  className={`flex-1 py-2 rounded-r-lg ${viewMode === 'year' ? 'bg-primary-500 text-white' : 'bg-white/50'}`}
                >
                  Tahun
                </button>
              </div>

              {viewMode === 'month' ? (
                // Month view options
                <React.Fragment>
                  {/* Month selection */}
                  <div className="mb-3">
                    <select
                      value={`${selectedMonth.getFullYear()}-${(selectedMonth.getMonth() + 1).toString().padStart(2, '0')}`}
                      onChange={handleMonthChange}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {monthOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year selection */}
                  <div className="mb-3">
                    <select
                      value={selectedMonth.getFullYear().toString()}
                      onChange={handleYearChange}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {yearOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Direct date selection */}
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Tanggal:</label>
                    <input
                      type="date"
                      value={selectedMonth.toISOString().split('T')[0]}
                      onChange={handleDateChange}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </React.Fragment>
              ) : (
                // Year view options
                <div>
                  <select
                    value={selectedMonth.getFullYear().toString()}
                    onChange={handleYearChange}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {yearOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Growth Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-accent-200/50 card-hover glass-card glass-card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-accent-500 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Pertumbuhan Pemasukan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <div className={`text-xl font-semibold ${incomeGrowth >= 0 ? 'text-accent-600' : 'text-danger-600'}`}>
                  {incomeGrowth >= 0 ? '+' : ''}{incomeGrowth.toFixed(1)}%
                </div>
                <div className="ml-2 text-sm text-text-500">
                  vs {formatPeriod(comparisonPeriod)}
                </div>
              </div>
              <div className="text-sm text-text-600 mt-1">
                {formatCurrency(selectedPeriodStats.income)} dari {formatCurrency(comparisonPeriodStats.income)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-danger-200/50 card-hover glass-card glass-card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-danger-600 flex items-center">
                <TrendingDown className="h-4 w-4 mr-1" />
                Pertumbuhan Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <div className={`text-xl font-semibold ${expenseGrowth >= 0 ? 'text-danger-600' : 'text-accent-600'}`}>
                  {expenseGrowth >= 0 ? '+' : ''}{expenseGrowth.toFixed(1)}%
                </div>
                <div className="ml-2 text-sm text-text-500">
                  vs {formatPeriod(comparisonPeriod)}
                </div>
              </div>
              <div className="text-sm text-text-600 mt-1">
                {formatCurrency(selectedPeriodStats.expense)} dari {formatCurrency(comparisonPeriodStats.expense)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary-200/50 card-hover glass-card glass-card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-primary-500 flex items-center">
                <Wallet className="h-4 w-4 mr-1" />
                Pertumbuhan Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <div className={`text-xl font-semibold ${balanceGrowth >= 0 ? 'text-accent-600' : 'text-danger-600'}`}>
                  {balanceGrowth >= 0 ? '+' : ''}{balanceGrowth.toFixed(1)}%
                </div>
                <div className="ml-2 text-sm text-text-500">
                  vs {formatPeriod(comparisonPeriod)}
                </div>
              </div>
              <div className="text-sm text-text-600 mt-1">
                {formatCurrency(selectedPeriodStats.balance)} dari {formatCurrency(comparisonPeriodStats.balance)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="mb-6 card-hover glass-card glass-card-hover">
          <CardHeader>
            <CardTitle className="text-lg">
              {viewMode === 'year'
                ? `Grafik Transaksi Tahunan ${selectedMonth.getFullYear()}`
                : `Grafik Transaksi Bulanan ${formatMonthName(selectedMonth)}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={selectedPeriodData} type="bar" />
          </CardContent>
        </Card>

        {/* Category Analysis */}
        <Card className="mb-6 card-hover glass-card glass-card-hover">
          <CardHeader>
            <CardTitle className="text-lg">Analisis Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryStats.length === 0 ? (
              <div className="text-center py-4 text-text-500">
                Tidak ada data transaksi untuk {viewMode === 'year' ? 'tahun' : 'bulan'} ini
              </div>
            ) : (
              <div className="space-y-4">
                {categoryStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-text-900">{stat.name}</div>
                      <div className="text-sm text-text-500">{stat.count} transaksi</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-text-900">{formatCurrency(stat.amount)}</div>
                      <div className="text-sm text-text-500">
                        {selectedPeriodStats.expense > 0
                          ? ((stat.amount / selectedPeriodStats.expense) * 100).toFixed(1)
                          : '0.0'}% dari pengeluaran
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="card-hover glass-card glass-card-hover">
          <CardHeader>
            <CardTitle className="text-lg">
              Ringkasan {viewMode === 'year' ? formatYear(selectedMonth) : `Bulan ${formatMonthName(selectedMonth)}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-accent-50 rounded-xl">
                <div className="text-accent-600 font-semibold">{formatCurrency(selectedPeriodStats.income)}</div>
                <div className="text-sm text-text-600">Total Pemasukan</div>
              </div>
              <div className="text-center p-4 bg-danger-50 rounded-xl">
                <div className="text-danger-600 font-semibold">{formatCurrency(selectedPeriodStats.expense)}</div>
                <div className="text-sm text-text-600">Total Pengeluaran</div>
              </div>
              <div className="text-center p-4 bg-primary-50 rounded-xl col-span-2">
                <div className={`font-semibold ${selectedPeriodStats.balance >= 0 ? 'text-accent-600' : 'text-danger-600'}`}>
                  {formatCurrency(selectedPeriodStats.balance)}
                </div>
                <div className="text-sm text-text-600">Saldo {viewMode === 'year' ? 'Tahun' : 'Bulan'} Ini</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}