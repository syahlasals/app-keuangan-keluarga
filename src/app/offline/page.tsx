'use client';

import { useEffect, useState } from 'react';
import { Card, Button } from '@/components/ui';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const { isOnline } = useOnlineStatus();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Redirect to home when back online
    if (isOnline) {
      window.location.href = '/';
    }
  }, [isOnline]);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Tidak Ada Koneksi Internet
            </h1>
            <p className="text-gray-600 text-sm">
              Periksa koneksi internet Anda dan coba lagi
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Mencoba lagi...' : 'Coba Lagi'}
            </Button>

            <div className="text-center">
              <div className="flex items-center justify-center text-xs text-gray-500">
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1 text-green-500" />
                    Terhubung
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1 text-red-500" />
                    Tidak Terhubung
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">
              Fitur Offline Tersedia
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Lihat transaksi yang tersimpan</li>
              <li>• Tambah transaksi baru</li>
              <li>• Data akan disinkronkan otomatis</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}