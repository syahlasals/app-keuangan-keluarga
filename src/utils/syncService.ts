import { supabase } from '@/lib/supabase';
import { offlineStorage } from './offlineStorage';
import type { Transaction, Category } from '@/types';

class SyncService {
  private isSubscribed: boolean = false;
  private syncInProgress: boolean = false;
  private maxRetryAttempts: number = 3;
  private retryDelay: number = 5000; // 5 seconds

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      // Listen for online/offline events
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));

      // Auto-sync on page visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.onLine) {
          this.syncPendingChanges();
        }
      });
    }
  }

  private handleOnline(): void {
    console.log('App is back online, starting sync...');
    this.syncPendingChanges();
  }

  private handleOffline(): void {
    console.log('App is offline');
  }

  async syncPendingChanges(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    this.syncInProgress = true;

    try {
      const syncQueue = await offlineStorage.getSyncQueue();
      console.log(`Syncing ${syncQueue.length} pending changes...`);

      for (const item of syncQueue) {
        try {
          await this.processQueueItem(item);
          await offlineStorage.removeSyncQueueItem(item.id);
        } catch (error) {
          console.error('Failed to sync item:', item, error);

          // Increment retry attempts
          item.attempts += 1;

          if (item.attempts >= this.maxRetryAttempts) {
            console.error('Max retry attempts reached for item:', item);
            await offlineStorage.removeSyncQueueItem(item.id);
          } else {
            await offlineStorage.updateSyncQueueItem(item);
          }
        }
      }

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processQueueItem(item: any): Promise<void> {
    const { type, action, data } = item;

    switch (type) {
      case 'transaction':
        await this.syncTransaction(action, data);
        break;
      case 'category':
        await this.syncCategory(action, data);
        break;
      default:
        throw new Error(`Unknown sync type: ${type}`);
    }
  }

  private async syncTransaction(action: string, data: Transaction): Promise<void> {
    switch (action) {
      case 'create': {
        const { error } = await supabase
          .from('transactions')
          .insert([{
            id: data.id,
            user_id: data.user_id,
            kategori_id: data.kategori_id,
            nominal: data.nominal,
            tipe: data.tipe,
            tanggal: data.tanggal,
            catatan: data.catatan,
            status: 'success',
          }]);

        if (error) throw error;

        // Update local storage to mark as synced
        await offlineStorage.saveTransaction({
          ...data,
          status: 'success',
        });
        break;
      }

      case 'update': {
        const { error } = await supabase
          .from('transactions')
          .update({
            kategori_id: data.kategori_id,
            nominal: data.nominal,
            tipe: data.tipe,
            tanggal: data.tanggal,
            catatan: data.catatan,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);

        if (error) throw error;
        break;
      }

      case 'delete': {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', data.id);

        if (error) throw error;

        // Remove from local storage
        await offlineStorage.deleteTransaction(data.id);
        break;
      }

      default:
        throw new Error(`Unknown transaction action: ${action}`);
    }
  }

  private async syncCategory(action: string, data: Category): Promise<void> {
    switch (action) {
      case 'create': {
        const { error } = await supabase
          .from('categories')
          .insert([{
            id: data.id,
            user_id: data.user_id,
            nama: data.nama,
          }]);

        if (error) throw error;
        break;
      }

      case 'update': {
        const { error } = await supabase
          .from('categories')
          .update({
            nama: data.nama,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);

        if (error) throw error;
        break;
      }

      case 'delete': {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', data.id);

        if (error) throw error;

        // Remove from local storage
        await offlineStorage.deleteCategory(data.id);
        break;
      }

      default:
        throw new Error(`Unknown category action: ${action}`);
    }
  }

  // Method to force sync (can be called manually)
  async forcSync(): Promise<void> {
    if (navigator.onLine) {
      await this.syncPendingChanges();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  // Method to get sync status
  getSyncStatus(): { isOnline: boolean; syncInProgress: boolean } {
    return {
      isOnline: navigator.onLine,
      syncInProgress: this.syncInProgress,
    };
  }

  // Method to get pending sync count
  async getPendingSyncCount(): Promise<number> {
    const syncQueue = await offlineStorage.getSyncQueue();
    return syncQueue.length;
  }
}

// Export singleton instance
export const syncService = new SyncService();

// Initialize sync service
if (typeof window !== 'undefined') {
  syncService;
}