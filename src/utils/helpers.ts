import { CURRENCY_FORMAT } from './constants';
import { clsx, type ClassValue } from 'clsx';

/**
 * Combine class names with proper merging using clsx
 */
export const cn = (...inputs: ClassValue[]): string => {
  return clsx(inputs);
};

/**
 * Format number as Indonesian Rupiah currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(CURRENCY_FORMAT.LOCALE, {
    style: CURRENCY_FORMAT.STYLE,
    currency: CURRENCY_FORMAT.CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format number with dot separators (e.g., 10.000)
 */
export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('id-ID').format(amount);
};

/**
 * Parse formatted number string to number
 */
export const parseFormattedNumber = (value: string): number => {
  const cleaned = value.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
};

/**
 * Format date to Indonesian format (dd/MM/yyyy)
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID');
};

/**
 * Format date for input[type="date"] (yyyy-MM-dd)
 */
export const formatDateForInput = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

/**
 * Get current date in yyyy-MM-dd format
 */
export const getCurrentDate = (): string => {
  return formatDateForInput(new Date());
};

/**
 * Get first day of current month
 */
export const getFirstDayOfMonth = (date: Date = new Date()): string => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return formatDateForInput(firstDay);
};

/**
 * Get last day of current month
 */
export const getLastDayOfMonth = (date: Date = new Date()): string => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return formatDateForInput(lastDay);
};

/**
 * Generate UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Check if device is online
 */
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};