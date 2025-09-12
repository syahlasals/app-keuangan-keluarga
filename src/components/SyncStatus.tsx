'use client';

import { useState, useEffect } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { syncService } from '@/utils/syncService';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface SyncStatusProps {
  showText?: boolean;
  size?: 'sm' | 'md';
}

export default function SyncStatus({ showText = false, size = 'sm' }: SyncStatusProps) {
  const { isOnline } = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const count = await syncService.getPendingSyncCount();
        setPendingCount(count);
      } catch (error) {
        console.error('Failed to get pending sync count:', error);
      }
    };

    updatePendingCount();

    // Update count periodically
    const interval = setInterval(updatePendingCount, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) return;

    setIsLoading(true);
    try {
      await syncService.forcSync();
      setPendingCount(0);
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const getSyncStatus = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        color: 'text-red-500',
        bgColor: 'bg-red-100',
        text: 'Offline',
        description: 'Tidak ada koneksi internet'
      };
    }

    if (isLoading) {
      return {
        icon: RefreshCw,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
        text: 'Syncing...',
        description: 'Menyinkronkan data'
      };
    }

    if (pendingCount > 0) {
      return {
        icon: AlertCircle,
        color: 'text-amber-500',
        bgColor: 'bg-amber-100',
        text: `${pendingCount} pending`,
        description: `${pendingCount} perubahan belum tersinkronisasi`
      };
    }

    return {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      text: 'Synced',
      description: 'Semua data tersinkronisasi'
    };
  };

  const status = getSyncStatus();
  const Icon = status.icon;

  if (showText) {
    return (
      <button
        onClick={handleManualSync}
        disabled={!isOnline || isLoading}
        className={`inline-flex items-center px-2 py-1 rounded-full ${textSize} font-medium ${status.bgColor} ${status.color} hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
        title={status.description}
      >
        <Icon className={`${iconSize} mr-1 ${isLoading ? 'animate-spin' : ''}`} />
        {status.text}
      </button>
    );
  }

  return (
    <button
      onClick={handleManualSync}
      disabled={!isOnline || isLoading}
      className={`inline-flex items-center justify-center p-1 rounded-full ${status.bgColor} hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
      title={status.description}
    >
      <Icon className={`${iconSize} ${status.color} ${isLoading ? 'animate-spin' : ''}`} />
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {pendingCount > 9 ? '9+' : pendingCount}
        </span>
      )}
    </button>
  );
}