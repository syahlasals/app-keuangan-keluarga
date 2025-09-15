export const DEFAULT_CATEGORIES = [
  'Makanan',
  'Transportasi',
  'Pendidikan',
  'Hiburan',
  'Rumah Tangga'
];

export const TRANSACTION_TYPES = {
  INCOME: 'pemasukan' as const,
  EXPENSE: 'pengeluaran' as const,
};

export const TRANSACTION_STATUS = {
  PENDING: 'pending' as const,
  SUCCESS: 'success' as const,
};

export const CURRENCY_FORMAT = {
  LOCALE: 'id-ID',
  CURRENCY: 'IDR',
  STYLE: 'currency' as const,
};

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';

export const APP_CONFIG = {
  PAGE_SIZE: 20,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  DEBOUNCE_DELAY: 300,
  SYNC_RETRY_DELAY: 5000,
  MAX_RETRY_ATTEMPTS: 3,
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transactions',
  PROFILE: '/profile',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

export const STORAGE_KEYS = {
  OFFLINE_TRANSACTIONS: 'offline_transactions',
  USER_PREFERENCES: 'user_preferences',
  LAST_SYNC: 'last_sync',
} as const;