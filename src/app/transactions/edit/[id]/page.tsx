'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { Card, Button, Input, Select } from '@/components/ui';
import { formatNumber, parseFormattedNumber, formatDateForInput } from '@/utils/helpers';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { TransactionUpdateInput } from '@/types';

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;

  const { user, initialized } = useAuthStore();
  const { transactions, updateTransaction, loading } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [formData, setFormData] = useState({
    tipe: 'pengeluaran' as 'pemasukan' | 'pengeluaran',
    nominal: '',
    kategori_id: '',
    tanggal: '',
    catatan: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && initialized) {
      fetchCategories();

      // Find the transaction to edit
      const transaction = transactions.find(t => t.id === transactionId);
      if (transaction) {
        setFormData({
          tipe: transaction.tipe,
          nominal: formatNumber(transaction.nominal),
          kategori_id: transaction.kategori_id || '',
          tanggal: formatDateForInput(transaction.tanggal),
          catatan: transaction.catatan || '',
        });
        setIsLoading(false);
      } else {
        // Transaction not found, redirect back
        router.push('/transactions');
      }
    }
  }, [user, initialized, transactionId, transactions, fetchCategories, router]);

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
    const value = e.target.value.replace(/[^d]/g, '');
    const formattedValue = value ? formatNumber(parseInt(value)) : '';
    setFormData(prev => ({ ...prev, nominal: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const transactionData: TransactionUpdateInput = {
      id: transactionId,
      tipe: formData.tipe,
      nominal: parseFormattedNumber(formData.nominal),
      kategori_id: formData.kategori_id || null,
      tanggal: formData.tanggal,
      catatan: formData.catatan.trim() || null,
    };

    const result = await updateTransaction(transactionData);

    if (result.error) {
      setErrors({ submit: result.error });
      setIsSubmitting(false);
    } else {
      router.push('/transactions');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="safe-top px-4 py-4">
          <div className="flex items-center">
            <Link href="/transactions" className="mr-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Edit Transaksi</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
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
                <Input
                  label="Nominal"
                  type="text"
                  value={formData.nominal}
                  onChange={handleNominalChange}
                  placeholder="0"
                  error={errors.nominal}
                  leftIcon={<span className="text-gray-500">Rp</span>}
                />

                {/* Category */}
                <Select
                  label="Kategori"
                  value={formData.kategori_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, kategori_id: e.target.value }))}
                  options={categoryOptions}
                  placeholder="Pilih kategori"
                />

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
          </Card>

          <div className="flex space-x-3">
            <Link href="/transactions" className="flex-1">
              <Button variant="outline" className="w-full">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}