'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { fetchAllTransactions } from '@/stores/fetchAllTransactions';
import { useCategoryStore } from '@/stores/categoryStore';
import { Button, Card, Input, Modal } from '@/components/ui';
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
  const router = useRouter();
  const searchParams = useSearchParams();
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

  // State for accurate balance
  const [accurateBalance, setAccurateBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Fetch all transactions and calculate accurate balance
  const calculateAccurateBalance = useCallback(async () => {
    setLoadingBalance(true);
    const all = await fetchAllTransactions();
    const total = all.reduce((balance, transaction) => {
      if (transaction.status !== 'success') return balance;
      if (transaction.tipe === 'pemasukan') {
        return balance + transaction.nominal;
      } else {
        return balance - transaction.nominal;
      }
    }, 0);
    setAccurateBalance(Math.max(0, total));
    setLoadingBalance(false);
  }, []);

  useEffect(() => {
    if (user && initialized) {
      calculateAccurateBalance();
    }
  }, [user, initialized, calculateAccurateBalance]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; detail?: Transaction } | null>(null);
  const [filterForm, setFilterForm] = useState<FilterOptions>({
    kategori_id: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  // Local state for filtered transactions
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  // State for transaction detail view
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);

  useEffect(() => {
    if (user && initialized) {
      fetchCategories();
      fetchTransactions();
    }
  }, [user, initialized, fetchCategories, fetchTransactions]);

  // Apply local filtering when transactions or filters change
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId && allTransactions.length > 0) {
      const transactionToShow = allTransactions.find(t => t.id === viewId);
      if (transactionToShow) {
        setSelectedTransaction(transactionToShow);
        setShowTransactionDetail(true);
      } else {
        // Jika ID di URL tidak valid, kembali ke daftar
        router.push('/transactions');
      }
    } else {
      setShowTransactionDetail(false);
      setSelectedTransaction(null);
    }
  }, [searchParams, allTransactions, router]);

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
      if (loading || !hasMore || showTransactionDetail) return;

      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        fetchTransactions();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, fetchTransactions, showTransactionDetail]);

  const handleSearch = useCallback(() => {
    setFilterForm((prev) => ({ ...prev, search: searchQuery }));
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
    setDeleteLoading(id);
    const result = await useTransactionStore.getState().deleteTransaction(id);

    if (result.error) {
      alert('Gagal menghapus transaksi: ' + result.error);
    }
    setDeleteLoading(null);
  };

  const openDeleteModal = (id: string, detail?: Transaction) => {
    setConfirmDelete({ id, detail });
  };

  const confirmDeleteTransaction = async () => {
    if (!confirmDelete) return;
    await handleDeleteTransaction(confirmDelete.id);
    setConfirmDelete(null);
    closeTransactionDetail();
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
    const category = categories.find((c) => c.id === transaction.kategori_id);
    return category?.nama || 'Unknown';
  };

  const getActiveFiltersCount = () => {
    return Object.values(filterForm).filter((value) => value && value !== '').length;
  };

  const handleViewTransaction = (transaction: Transaction) => {
    router.push(`/transactions?view=${transaction.id}`, { scroll: false });
  };

  const closeTransactionDetail = () => {
    router.push('/transactions', { scroll: false });
  };

  const handleEditTransaction = () => {
    if (selectedTransaction) {
      router.push(`/transactions/edit/${selectedTransaction.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background-500 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white/90 border-b sticky top-0 z-40 shadow-glass backdrop-blur-md rounded-b-3xl">
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

      {/* Transaction List or Detail View */}
      <div className="px-4 py-6">
        {showTransactionDetail && selectedTransaction ? (
          /* Transaction Detail View */
          <Card className="transaction-card shadow-glass glass-card glass-card-hover">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-900">Detail Transaksi</h2>
                <button
                  onClick={closeTransactionDetail}
                  className="p-2 text-text-400 hover:text-primary-500 hover:bg-white/70 transition-colors duration-300 rounded-lg disabled:opacity-50 backdrop-blur-md shadow-glass"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-text-200">
                  <span className="text-text-600">Jenis Transaksi</span>
                  <span className={`font-semibold ${selectedTransaction.tipe === 'pemasukan' ? 'text-accent-500' : 'text-danger-600'}`}>
                    {selectedTransaction.tipe === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-text-200">
                  <span className="text-text-600">Nominal</span>
                  <span className={`text-lg font-semibold ${selectedTransaction.tipe === 'pemasukan' ? 'text-accent-500' : 'text-danger-600'}`}>
                    {selectedTransaction.tipe === 'pemasukan' ? '+' : '-'}{formatCurrency(selectedTransaction.nominal)}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-text-200">
                  <span className="text-text-600">Kategori</span>
                  <span className="font-medium text-text-900">
                    {getCategoryName(selectedTransaction)}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-text-200">
                  <span className="text-text-600">Tanggal</span>
                  <span className="font-medium text-text-900">
                    {formatDate(selectedTransaction.tanggal)}
                  </span>
                </div>

                {selectedTransaction.catatan && (
                  <div className="pb-3 border-b border-text-200">
                    <span className="text-text-600 block mb-1">Catatan</span>
                    <p className="text-text-900">{selectedTransaction.catatan}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pb-3 border-b border-text-200">
                  <span className="text-text-600">Status</span>
                  <TransactionStatus status={selectedTransaction.status} />
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <Button
                  variant="outline"
                  onClick={handleEditTransaction}
                  className="flex-1 flex items-center justify-center rounded-xl"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openDeleteModal(selectedTransaction.id, selectedTransaction)}
                  loading={deleteLoading === selectedTransaction.id}
                  className="flex-1 flex items-center justify-center rounded-xl text-danger-600 border-danger-200 hover:bg-danger-50/80"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </Button>
              </div>
            </div>
          </Card>
        ) : filteredTransactions.length === 0 && !loading ? (
          /* Empty State */
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
          /* Transaction List */
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="transaction-card shadow-glass hover:shadow-glass-lg glass-card glass-card-hover cursor-pointer"
                onClick={() => handleViewTransaction(transaction)}
              >
                <div className="flex items-center justify-between p-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-semibold ${transaction.tipe === 'pemasukan' ? 'text-accent-500' : 'text-danger-600'}`}>
                          {transaction.tipe === 'pemasukan' ? '+' : '-'}{formatCurrency(transaction.nominal)}
                        </span>
                        <TransactionStatus status={transaction.status} />
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
                      <p className="text-sm text-text-600 mt-2 truncate">
                        {transaction.catatan}
                      </p>
                    )}
                  </div>
                  <div className="ml-2 text-text-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Card>
            ))}

            {/* Loading more indicator */}
            {loading && (
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

      {/* Modal Konfirmasi Hapus Transaksi (tetap di luar) */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Konfirmasi Hapus Transaksi" size="sm">
          {/* ... (modal JSX remains the same) ... */}
          <div className="text-center p-2">
          <div className="mb-3 text-danger-600 font-semibold text-lg">Hapus Transaksi?</div>
          <div className="mb-4 text-text-700">
            Apakah Anda yakin ingin menghapus transaksi ini?
            {confirmDelete?.detail && (
              <div className="mt-2 text-sm text-text-600">
                <div><b>{confirmDelete.detail.tipe === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</b> {formatCurrency(confirmDelete.detail.nominal)}</div>
                <div>{getCategoryName(confirmDelete.detail)} &middot; {formatDate(confirmDelete.detail.tanggal)}</div>
                {confirmDelete.detail.catatan && <div className="italic">{confirmDelete.detail.catatan}</div>}
              </div>
            )}
          </div>
          <div className="flex justify-center gap-3 mt-4">
            <Button variant="outline" onClick={() => setConfirmDelete(null)} disabled={deleteLoading === confirmDelete?.id}>
              Batal
            </Button>
            <Button variant="danger" onClick={confirmDeleteTransaction} loading={deleteLoading === confirmDelete?.id}>
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
      
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