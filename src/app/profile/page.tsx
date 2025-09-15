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
    <div className="min-h-screen bg-background-500 pb-20 md:pb-8">
      {/* Header */}
      <div className="gradient-header px-4 py-4">
        <div className="safe-top px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4 backdrop-blur-md shadow-glass">
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
        <Card className="mb-6 bg-gradient-to-r from-accent-100/90 to-background-hint-100/90 border-none shadow-glass-xl glass-card glass-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center text-text-900">
              <Wallet className="h-5 w-5 mr-2 text-accent-500" />
              Ringkasan Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-900 mb-4">
              {formatCurrency(currentBalance)}
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-text-600">Total Transaksi</p>
                <p className="font-semibold text-text-900">{totalTransactions}</p>
              </div>
              <div className="text-center">
                <p className="text-text-600">Pemasukan</p>
                <p className="font-semibold text-accent-500">{incomeTransactions}</p>
              </div>
              <div className="text-center">
                <p className="text-text-600">Pengeluaran</p>
                <p className="font-semibold text-danger-600">{expenseTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3">
          {/* Categories Management */}
          <Card className="card-hover glass-card glass-card-hover">
            <CardContent className="p-0">
              <Link href="/categories" className="block">
                <div className="w-full p-4 flex items-center justify-between text-left hover:bg-white/70 transition-colors duration-300 rounded-xl backdrop-blur-md shadow-glass">
                  <div className="flex items-center">
                    <Tag className="h-5 w-5 text-text-400 mr-3" />
                    <div>
                      <p className="font-medium text-text-900">Kelola Kategori</p>
                      <p className="text-sm text-text-500">Tambah, edit, atau hapus kategori transaksi</p>
                    </div>
                  </div>
                  <div className="text-text-400">
                    <span className="text-sm">→</span>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* PWA Install */}
          <Card className="card-hover glass-card glass-card-hover">
            <CardContent className="p-0">
              <button
                onClick={() => {
                  // Show install prompt info
                  alert('Untuk menginstall aplikasi, cari opsi "Tambah ke Layar Utama" atau "Install App" di browser Anda.');
                }}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/70 transition-colors duration-300 rounded-xl backdrop-blur-md shadow-glass"
              >
                <div className="flex items-center">
                  <Smartphone className="h-5 w-5 text-text-400 mr-3" />
                  <div>
                    <p className="font-medium text-text-900">Install Aplikasi</p>
                    <p className="text-sm text-text-500">Pasang di layar utama untuk akses cepat</p>
                  </div>
                </div>
                <div className="text-text-400">
                  <span className="text-sm">→</span>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="card-hover glass-card glass-card-hover">
            <CardContent className="p-0">
              <button className="w-full p-4 flex items-center justify-between text-left hover:bg-white/70 transition-colors duration-300 rounded-xl backdrop-blur-md shadow-glass">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-text-400 mr-3" />
                  <div>
                    <p className="font-medium text-text-900">Statistik Keuangan</p>
                    <p className="text-sm text-text-500">Lihat laporan dan analisis</p>
                  </div>
                </div>
                <div className="text-text-400">
                  <span className="text-sm">Segera Hadir</span>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="card-hover glass-card glass-card-hover">
            <CardContent className="p-0">
              <button className="w-full p-4 flex items-center justify-between text-left hover:bg-white/70 transition-colors duration-300 rounded-xl backdrop-blur-md shadow-glass">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-text-400 mr-3" />
                  <div>
                    <p className="font-medium text-text-900">Pengaturan</p>
                    <p className="text-sm text-text-500">Kelola preferensi aplikasi</p>
                  </div>
                </div>
                <div className="text-text-400">
                  <span className="text-sm">Segera Hadir</span>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card className="card-hover glass-card glass-card-hover">
            <CardContent className="p-0">
              <button className="w-full p-4 flex items-center justify-between text-left hover:bg-white/70 transition-colors duration-300 rounded-xl backdrop-blur-md shadow-glass">
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 text-text-400 mr-3" />
                  <div>
                    <p className="font-medium text-text-900">Bantuan</p>
                    <p className="text-sm text-text-500">FAQ dan panduan penggunaan</p>
                  </div>
                </div>
                <div className="text-text-400">
                  <span className="text-sm">Segera Hadir</span>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* App Info */}
        <Card className="mt-6 shadow-glass glass-card glass-card-hover">
          <CardContent className="p-4">
            <div className="text-center text-sm text-text-500">
              <h3 className="font-semibold text-text-800 mb-2">Keuangan Keluarga PWA</h3>
              <p className="mb-1">Versi 1.0.3</p>
              <p className="mb-3">Kelola keuangan keluarga dengan mudah</p>

              <div className="flex items-center justify-center space-x-4 text-xs">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mr-1"></div>
                  PWA Ready
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mr-1"></div>
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
            className="w-full flex items-center justify-center rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isSigningOut ? 'Mengeluarkan...' : 'Keluar'}
          </Button>
        </div>
      </div>
    </div>
  );
}