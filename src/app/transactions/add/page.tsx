'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { Card, Button, Input, Select } from '@/components/ui';
import { getCurrentDate, parseFormattedNumber, formatNumber } from '@/utils/helpers';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import type { TransactionCreateInput } from '@/types';

export default function AddTransactionPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { createTransaction, loading } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [formData, setFormData] = useState({
    tipe: 'pengeluaran' as 'pemasukan' | 'pengeluaran',
    nominal: '',
    kategori_id: '',
    tanggal: getCurrentDate(),
    catatan: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (user && initialized) {
      fetchCategories();
    }
  }, [user, initialized, fetchCategories]);

  const categoryOptions = [
    { value: '', label: 'Pilih Kategori (Opsional)' },
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

    // Remove the category validation for expenses since it's now optional
    // Only validate category for expenses if needed in the future

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    const formattedValue = value ? formatNumber(parseInt(value)) : '';
    setFormData(prev => ({ ...prev, nominal: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const transactionData: TransactionCreateInput = {
      tipe: formData.tipe,
      nominal: parseFormattedNumber(formData.nominal),
      // Only include category for expenses (but it's optional now)
      kategori_id: formData.tipe === 'pengeluaran' ? (formData.kategori_id || null) : null,
      tanggal: formData.tanggal,
      catatan: formData.catatan.trim() || null,
    };

    const result = await createTransaction(transactionData);

    if (result.error) {
      setErrors({ submit: result.error });
      setIsSubmitting(false);
    } else {
      router.push('/transactions');
    }
  };

  if (initialized && !user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background-500 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white/90 border-b backdrop-blur-md shadow-glass rounded-b-3xl">
        <div className="safe-top px-4 py-4">
          <div className="flex items-center">
            <Link href="/transactions" className="mr-4">
              <button className="p-2 text-text-400 hover:text-primary-500 hover:bg-white/70 transition-colors duration-300 rounded-xl disabled:opacity-50 backdrop-blur-md shadow-glass">
                  <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <h1 className="text-xl font-semibold text-text-900">Tambah Transaksi</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6 glass-card glass-card-hover">
            <div className="p-6">
              {errors.submit && (
                <div className="mb-4 p-3 bg-danger-50/80 border border-danger-200/50 text-danger-700 rounded-lg backdrop-blur-md shadow-glass">
                  {errors.submit}
                </div>
              )}

              <div className="space-y-4">
                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-medium text-text-700 mb-2">
                    Tipe Transaksi
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tipe: 'pemasukan' }))}
                      className={`p-3 border rounded-lg text-center transition-all duration-300 ${formData.tipe === 'pemasukan'
                        ? 'border-success-500 bg-success-50/90 text-success-700 shadow-glass'
                        : 'border-text-300 text-text-700 hover:bg-text-50/70'
                        } backdrop-blur-md`}
                    >
                      Pemasukan
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tipe: 'pengeluaran' }))}
                      className={`p-3 border rounded-lg text-center transition-all duration-300 ${formData.tipe === 'pengeluaran'
                        ? 'border-danger-500 bg-danger-50/90 text-danger-700 shadow-glass'
                        : 'border-text-300 text-text-700 hover:bg-text-50/70'
                        } backdrop-blur-md`}
                    >
                      Pengeluaran
                    </button>
                  </div>
                </div>

                {/* Nominal */}
                <Input
                  label="Nominal"
                  type="text"
                  value={formData.nominal}
                  onChange={handleNominalChange}
                  placeholder="0"
                  error={errors.nominal}
                  leftIcon={<span className="text-text-400">Rp</span>}
                />

                {/* Category - Only show for expenses */}
                {formData.tipe === 'pengeluaran' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-text-700">
                        Kategori (Opsional)
                      </label>
                    </div>

                    <Select
                      value={formData.kategori_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, kategori_id: e.target.value }))}
                      options={categoryOptions}
                      placeholder="Pilih kategori (opsional)"
                    />

                    {showAddCategory && (
                      <div className="mt-2 flex space-x-2">
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Nama kategori baru"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement add category
                            setShowAddCategory(false);
                            setNewCategoryName('');
                          }}
                        >
                          Tambah
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Date */}
                <Input
                  label="Tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                  error={errors.tanggal}
                />

                {/* Notes */}
                <div>
                  <label htmlFor="catatan" className="block text-sm font-medium text-text-700 mb-1">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    id="catatan"
                    value={formData.catatan}
                    onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
                    placeholder="Tambahkan catatan..."
                    rows={3}
                    className="w-full px-3 py-2 border border-text-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 backdrop-blur-md shadow-glass"
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex space-x-3">
            <Link href="/transactions" className="flex-1">
              <Button variant="outline" className="w-full">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              loading={isSubmitting}
              className="flex-1"
            >
              Simpan Transaksi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}