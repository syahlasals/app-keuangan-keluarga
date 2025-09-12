'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { formatDateForInput, parseFormattedNumber, formatNumber } from '@/utils/helpers';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import Link from 'next/link';
import type { TransactionUpdateInput } from '@/types';

export default function EditTransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id');

  const { user, initialized } = useAuthStore();
  const { transactions, updateTransaction, loading } = useTransactionStore();
  const { categories, fetchCategories, createCategory } = useCategoryStore();

  const [formData, setFormData] = useState({
    tipe: 'pengeluaran' as 'pemasukan' | 'pengeluaran',
    nominal: '',
    kategori_id: '',
    tanggal: '',
    catatan: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const currentTransaction = transactions.find(t => t.id === transactionId);

  useEffect(() => {
    if (user && initialized) {
      fetchCategories();
    }
  }, [user, initialized, fetchCategories]);

  useEffect(() => {
    if (currentTransaction) {
      setFormData({
        tipe: currentTransaction.tipe,
        nominal: formatNumber(currentTransaction.nominal),
        kategori_id: currentTransaction.kategori_id || '',
        tanggal: formatDateForInput(currentTransaction.tanggal),
        catatan: currentTransaction.catatan || '',
      });
      setIsLoading(false);
    } else if (transactionId && !isLoading) {
      // Transaction not found
      router.push('/transactions');
    }
  }, [currentTransaction, transactionId, router, isLoading]);

  const categoryOptions = [
    { value: '', label: 'Pilih Kategori' },
    ...categories.map(cat => ({ value: cat.id, label: cat.nama })),
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nominal || parseFormattedNumber(formData.nominal) <= 0) {
      newErrors.nominal = 'Nominal harus lebih dari 0';
    }

    if (!formData.tanggal) {
      newErrors.tanggal = 'Tanggal wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\\d]/g, '');
    const formattedValue = value ? formatNumber(parseInt(value)) : '';
    setFormData(prev => ({ ...prev, nominal: formattedValue }));
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    const result = await createCategory(newCategoryName.trim());
    if (result.error) {
      setErrors({ category: result.error });
    } else if (result.data) {
      setFormData(prev => ({ ...prev, kategori_id: result.data!.id }));
      setShowAddCategory(false);
      setNewCategoryName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const updateData: TransactionUpdateInput = {
      id: transactionId,
      tipe: formData.tipe,
      nominal: parseFormattedNumber(formData.nominal),
      kategori_id: formData.kategori_id || null,
      tanggal: formData.tanggal,
      catatan: formData.catatan.trim() || null,
    };

    const result = await updateTransaction(updateData);

    if (result.error) {
      setErrors({ submit: result.error });
      setIsSubmitting(false);
    } else {
      router.push('/transactions');
    }
  };

  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat transaksi...</p>
        </div>
      </div>
    );
  }

  if (!currentTransaction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Transaksi tidak ditemukan</p>
          <Link
            href="/transactions"
            className="btn btn-primary"
          >
            Kembali ke Transaksi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="safe-top px-4 py-4">
          <div className="flex items-center">
            <Link href="/transactions" className="mr-4">
              <button className="btn btn-secondary btn-sm">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Edit Transaksi</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <form onSubmit={handleSubmit}>
          <div className="card mb-6">
            <div className="p-6">
              {errors.submit && (
                <div className="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg">
                  {errors.submit}
                </div>
              )}

              <div className="space-y-4">
                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Transaksi
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tipe: 'pemasukan' }))}
                      className={`p-3 border rounded-lg text-center transition-colors ${formData.tipe === 'pemasukan'
                        ? 'border-success-500 bg-success-50 text-success-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Pemasukan
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tipe: 'pengeluaran' }))}
                      className={`p-3 border rounded-lg text-center transition-colors ${formData.tipe === 'pengeluaran'
                        ? 'border-danger-500 bg-danger-50 text-danger-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Pengeluaran
                    </button>
                  </div>
                </div>

                {/* Nominal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nominal <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">Rp</span>
                    </div>
                    <input
                      type="text"
                      value={formData.nominal}
                      onChange={handleNominalChange}
                      placeholder="0"
                      className={`input pl-10 ${errors.nominal ? 'border-danger-300' : ''}`}
                    />
                  </div>
                  {errors.nominal && (
                    <p className="mt-1 text-sm text-danger-600">{errors.nominal}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Kategori
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(!showAddCategory)}
                      className="text-primary-600 text-sm hover:text-primary-700"
                    >
                      <Plus className="h-4 w-4 inline mr-1" />
                      Tambah Kategori
                    </button>
                  </div>

                  <select
                    value={formData.kategori_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, kategori_id: e.target.value }))}
                    className="input"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {errors.category && (
                    <p className="mt-1 text-sm text-danger-600">{errors.category}</p>
                  )}

                  {showAddCategory && (
                    <div className="mt-2 flex space-x-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nama kategori baru"
                        className="input flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="btn btn-primary btn-sm"
                        disabled={!newCategoryName.trim()}
                      >
                        Tambah
                      </button>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                    className={`input ${errors.tanggal ? 'border-danger-300' : ''}`}
                  />
                  {errors.tanggal && (
                    <p className="mt-1 text-sm text-danger-600">{errors.tanggal}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="catatan" className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    id="catatan"
                    value={formData.catatan}
                    onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
                    placeholder="Tambahkan catatan..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Link href="/transactions" className="flex-1">
              <button type="button" className="btn btn-secondary w-full">
                Batal
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}