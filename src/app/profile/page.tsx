'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import SyncStatus from '@/components/SyncStatus';
import { formatCurrency } from '@/utils/helpers';
import { LogOut, User, Wallet, BarChart3, Settings, HelpCircle, Tag, Smartphone } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, initialized } = useAuthStore();
  const { transactions, getCurrentBalance } = useTransactionStore();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      setIsSigningOut(true);
      await signOut();
      router.replace('/auth/login');
    }
  };

  const currentBalance = getCurrentBalance();
  const totalTransactions = transactions.length;
  const incomeTransactions = transactions.filter(t => t.tipe === 'pemasukan').length;
  const expenseTransactions = transactions.filter(t => t.tipe === 'pengeluaran').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="safe-top px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Profil</h1>
                <p className="text-primary-100 text-sm">{user?.email}</p>
              </div>
            </div>
            <SyncStatus size="md" />
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Balance Summary */}
        <Card className="mb-6 bg-gradient-to-r from-success-50 to-primary-50 border-none">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-700">
              <Wallet className="h-5 w-5 mr-2" />
              Ringkasan Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800 mb-4">
              {formatCurrency(currentBalance)}
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Total Transaksi</p>
                <p className="font-semibold text-gray-800">{totalTransactions}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Pemasukan</p>
                <p className="font-semibold text-success-600">{incomeTransactions}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Pengeluaran</p>
                <p className="font-semibold text-danger-600">{expenseTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3">
          {/* Categories Management */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <Link href="/categories" className="block">
                <div className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <Tag className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Kelola Kategori</p>
                      <p className="text-sm text-gray-500">Tambah, edit, atau hapus kategori transaksi</p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <span className="text-sm">→</span>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* PWA Install */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <button
                onClick={() => {
                  // Show install prompt info
                  alert('Untuk menginstall aplikasi, cari opsi "Tambah ke Layar Utama" atau "Install App" di browser Anda.');
                }}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Install Aplikasi</p>
                    <p className="text-sm text-gray-500">Pasang di layar utama untuk akses cepat</p>
                  </div>
                </div>
                <div className="text-gray-400">
                  <span className="text-sm">→</span>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <button className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Statistik Keuangan</p>
                    <p className="text-sm text-gray-500">Lihat laporan dan analisis</p>
                  </div>
                </div>
                <div className="text-gray-400">
                  <span className="text-sm">Segera Hadir</span>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <button className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Pengaturan</p>
                    <p className="text-sm text-gray-500">Kelola preferensi aplikasi</p>
                  </div>
                </div>
                <div className="text-gray-400">
                  <span className="text-sm">Segera Hadir</span>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <button className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Bantuan</p>
                    <p className="text-sm text-gray-500">FAQ dan panduan penggunaan</p>
                  </div>
                </div>
                <div className="text-gray-400">
                  <span className="text-sm">Segera Hadir</span>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* App Info */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="text-center text-sm text-gray-500">
              <h3 className="font-medium text-gray-700 mb-2">Keuangan Keluarga PWA</h3>
              <p className="mb-1">Versi 1.0.2</p>
              <p className="mb-3">Kelola keuangan keluarga dengan mudah</p>

              <div className="flex items-center justify-center space-x-4 text-xs">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  PWA Ready
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                  Offline Support
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <div className="mt-6">
          <Button
            variant="danger"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center justify-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isSigningOut ? 'Mengeluarkan...' : 'Keluar'}
          </Button>
        </div>
      </div>
    </div>
  );
}