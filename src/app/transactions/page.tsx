'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { Button, Card, Input } from '@/components/ui';
import TransactionStatus from '@/components/TransactionStatus';
import SyncStatus from '@/components/SyncStatus';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useDataRefresh } from '@/hooks/useDataRefresh';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ArrowUp,
  Calendar,
  Tag,
  X
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/utils/helpers';
import type { FilterOptions, Transaction } from '@/types';

export default function TransactionsPage() {
  const { user, initialized } = useAuthStore();
  const {
    transactions: allTransactions,
    loading,
    hasMore,
    fetchTransactions
  } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { isOnline } = useOnlineStatus();

  // Auto-refresh data when page becomes visible
  useDataRefresh();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [filterForm, setFilterForm] = useState<FilterOptions>({
    kategori_id: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  // Local state for filtered transactions
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user && initialized) {
      fetchCategories();
      fetchTransactions(true);
    }
  }, [user, initialized, fetchCategories, fetchTransactions]);

  // Apply local filtering when transactions or filters change
  useEffect(() => {
    let result = [...allTransactions];

    // Apply category filter
    if (filterForm.kategori_id) {
      result = result.filter(t => t.kategori_id === filterForm.kategori_id);
    }

    // Apply date filters
    if (filterForm.startDate) {
      result = result.filter(t => t.tanggal >= filterForm.startDate!);
    }

    if (filterForm.endDate) {
      result = result.filter(t => t.tanggal <= filterForm.endDate!);
    }

    // Apply search filter
    if (filterForm.search) {
      const searchLower = filterForm.search.toLowerCase();
      result = result.filter(t =>
        (t.catatan && t.catatan.toLowerCase().includes(searchLower)) ||
        (t.kategori_id && categories.find(c => c.id === t.kategori_id)?.nama.toLowerCase().includes(searchLower))
      );
    }

    setFilteredTransactions(result);
  }, [allTransactions, filterForm, categories]);

  // Handle scroll for "scroll to top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        fetchTransactions(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, fetchTransactions]);

  const handleSearch = useCallback(() => {
    setFilterForm(prev => ({ ...prev, search: searchQuery }));
  }, [searchQuery]);

  const handleApplyFilters = () => {
    // Filters are applied automatically through the useEffect above
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilterForm({
      kategori_id: '',
      startDate: '',
      endDate: '',
      search: ''
    });
    setSearchQuery('');
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;

    setDeleteLoading(id);
    const result = await useTransactionStore.getState().deleteTransaction(id);

    if (result.error) {
      alert('Gagal menghapus transaksi: ' + result.error);
    }
    setDeleteLoading(null);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryName = (transaction: any) => {
    // For income transactions, show "Pemasukan" instead of "Tanpa Kategori"
    if (transaction.tipe === 'pemasukan') {
      return 'Pemasukan';
    }

    // For expenses, show category name if available, otherwise "Tanpa Kategori"
    if (!transaction.kategori_id) return 'Tanpa Kategori';
    const category = categories.find(c => c.id === transaction.kategori_id);
    return category?.nama || 'Unknown';
  };

  const getActiveFiltersCount = () => {
    return Object.values(filterForm).filter(value => value && value !== '').length;
  };

  return (
    <div className="min-h-screen bg-background-500 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white/90 border-b sticky top-0 z-40 shadow-glass backdrop-blur-md">
        <div className="safe-top px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-text-900">Transaksi</h1>
            <div className="flex items-center space-x-2">
              <SyncStatus showText size="sm" />
              {!isOnline && (
                <div className="text-xs bg-amber-100/80 text-amber-700 px-2.5 py-1 rounded-lg backdrop-blur-md shadow-glass">
                  Offline
                </div>
              )}
              <Link href="/transactions/add">
                <Button size="sm" className="flex items-center rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-3 flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi..."
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`relative ${getActiveFiltersCount() > 0 ? 'bg-primary-100/80 border-primary-200/50' : ''}`}
            >
              <Filter className="h-4 w-4" />
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="mt-3 p-4 shadow-glass glass-card">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-text-900">Filter Transaksi</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">
                      Kategori
                    </label>
                    <select
                      value={filterForm.kategori_id || ''}
                      onChange={(e) => setFilterForm(prev => ({ ...prev, kategori_id: e.target.value }))}
                      className="input"
                    >
                      <option value="">Semua Kategori</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">
                      Dari Tanggal
                    </label>
                    <Input
                      type="date"
                      value={filterForm.startDate}
                      onChange={(e) => setFilterForm(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">
                      Sampai Tanggal
                    </label>
                    <Input
                      type="date"
                      value={filterForm.endDate}
                      onChange={(e) => setFilterForm(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                    Reset Filter
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Transaction List */}
      <div className="px-4 py-6">
        {filteredTransactions.length === 0 ? (
          <Card className="p-8 text-center shadow-glass-xl glass-card glass-card-hover">
            <div className="text-text-400 mb-4">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-text-900 mb-2">
              Belum ada transaksi
            </h3>
            <p className="text-text-500 mb-4">
              Mulai catat pemasukan dan pengeluaran Anda
            </p>
            <Link href="/transactions/add">
              <Button className="flex items-center mx-auto rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Transaksi Pertama
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="transaction-card shadow-glass hover:shadow-glass-lg glass-card glass-card-hover">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-semibold ${transaction.tipe === 'pemasukan' ? 'text-accent-500' : 'text-danger-600'}`}>
                          {transaction.tipe === 'pemasukan' ? '+' : '-'}{formatCurrency(transaction.nominal)}
                        </span>
                        <TransactionStatus status={transaction.status} />
                      </div>
                      <div className="flex space-x-1">
                        <Link href={`/transactions/edit/${transaction.id}`}>
                          <Button variant="outline" size="sm" className="p-2 rounded-lg">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          loading={deleteLoading === transaction.id}
                          className="text-danger-600 hover:text-danger-700 p-2 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-text-500 space-x-4">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        {getCategoryName(transaction)}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(transaction.tanggal)}
                      </div>
                    </div>

                    {transaction.catatan && (
                      <p className="text-sm text-text-600 mt-2">
                        {transaction.catatan}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* Loading more indicator */}
            {loading && filteredTransactions.length > 0 && (
              <div className="text-center py-4 text-text-500 text-sm">
                Memuat lebih banyak...
              </div>
            )}

            {/* No more data */}
            {!hasMore && filteredTransactions.length > 0 && (
              <div className="text-center py-4 text-text-500 text-sm">
                Tidak ada transaksi lagi
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 bg-primary-500/90 text-white p-3 rounded-full shadow-glass-lg hover:bg-primary-600 transition-all duration-300 z-50 md:bottom-8 hover:shadow-xl backdrop-blur-md"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}