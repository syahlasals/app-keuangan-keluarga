// IndexedDB utility for offline storage
import { openDB, IDBPDatabase } from 'idb';
import type { Transaction, Category } from '@/types';
import { generateUUID } from './helpers';
const DB_NAME = 'KeuanganKeluarga';
const DB_VERSION = 1;
const TRANSACTIONS_STORE = 'transactions';
const CATEGORIES_STORE = 'categories';
const SYNC_QUEUE_STORE = 'syncQueue';
interface SyncQueueItem {
  id: string;
  type: 'transaction' | 'category';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  attempts: number;

}
class OfflineStorage {
  private db: IDBPDatabase | null = null;
  async init(): Promise<void> {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Transactions store
          if (!db.objectStoreNames.contains(TRANSACTIONS_STORE)) {
            const transactionStore = db.createObjectStore(TRANSACTIONS_STORE, {
              keyPath: 'id',
            });
            transactionStore.createIndex('user_id', 'user_id');
            transactionStore.createIndex('tanggal', 'tanggal');
            transactionStore.createIndex('status', 'status');
          }
          // Categories store
          if (!db.objectStoreNames.contains(CATEGORIES_STORE)) {
            const categoryStore = db.createObjectStore(CATEGORIES_STORE, {
              keyPath: 'id',
            });
            categoryStore.createIndex('user_id', 'user_id');
          }
          // Sync queue store
          if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
            const syncStore = db.createObjectStore(SYNC_QUEUE_STORE, {
              keyPath: 'id',
            });
            syncStore.createIndex('timestamp', 'timestamp');
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }
  // Transaction operations
  async saveTransaction(transaction: Transaction): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put(TRANSACTIONS_STORE, transaction);
  }
  async getTransactions(userId: string): Promise<Transaction[]> {
    if (!this.db) await this.init();
    if (!this.db) return [];
    const tx = this.db.transaction(TRANSACTIONS_STORE, 'readonly');
    const index = tx.store.index('user_id');
    return await index.getAll(userId);
  }
  async deleteTransaction(id: string): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete(TRANSACTIONS_STORE, id);
  }
  // Category operations
  async saveCategory(category: Category): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put(CATEGORIES_STORE, category);
  }
  async getCategories(userId: string): Promise<Category[]> {
    if (!this.db) await this.init();
    if (!this.db) return [];
    const tx = this.db.transaction(CATEGORIES_STORE, 'readonly');
    const index = tx.store.index('user_id');
    return await index.getAll(userId);
  }
  async deleteCategory(id: string): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete(CATEGORIES_STORE, id);
  }
  // Sync queue operations
  async addToSyncQueue(
    type: 'transaction' | 'category',
    action: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');
    const queueItem: SyncQueueItem = {
      id: generateUUID(),
      type,
      action,
      data,
      timestamp: Date.now(),
      attempts: 0,
    };
    await this.db.put(SYNC_QUEUE_STORE, queueItem);
  }
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!this.db) await this.init();
    if (!this.db) return [];
    const tx = this.db.transaction(SYNC_QUEUE_STORE, 'readonly');
    return await tx.store.getAll();
  }
  async removeSyncQueueItem(id: string): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete(SYNC_QUEUE_STORE, id);
  }
  async updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put(SYNC_QUEUE_STORE, item);
  }
  // Utility methods
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');
    const tx = this.db.transaction(
      [TRANSACTIONS_STORE, CATEGORIES_STORE, SYNC_QUEUE_STORE],
      'readwrite'
    );
    await Promise.all([
      tx.objectStore(TRANSACTIONS_STORE).clear(),
      tx.objectStore(CATEGORIES_STORE).clear(),
      tx.objectStore(SYNC_QUEUE_STORE).clear(),
    ]);
  }
  async getPendingTransactions(userId: string): Promise<Transaction[]> {
    if (!this.db) await this.init();
    if (!this.db) return [];
    const transactions = await this.getTransactions(userId);
    return transactions.filter(t => t.status === 'pending');
  }
}
// Export singleton instance
export const offlineStorage = new OfflineStorage();
// Helper function to check if we're offline
export const isOffline = (): boolean => {
  return typeof navigator !== 'undefined' && !navigator.onLine;
};
// Helper function to handle offline transaction creation
export const createOfflineTransaction = async (
  transactionData: any,
  userId: string
): Promise<Transaction> => {
  const transaction: Transaction = {
    ...transactionData,
    id: generateUUID(),
    user_id: userId,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  // Save to offline storage
  await offlineStorage.saveTransaction(transaction);

  // Add to sync queue
  await offlineStorage.addToSyncQueue('transaction', 'create', transaction);
  return transaction;
};
// Helper function to handle offline category creation
export const createOfflineCategory = async (
  categoryData: any,
  userId: string
): Promise<Category> => {
  const category: Category = {
    ...categoryData,
    id: generateUUID(),
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  // Save to offline storage
  await offlineStorage.saveCategory(category);

  // Add to sync queue
  await offlineStorage.addToSyncQueue('category', 'create', category);
  return category;
};