import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || '';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number, currency = 'USD'): string {
  if (currency === 'TND') {
    return `${amount.toFixed(3)} د.ت`;
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatPrice(amount: number, currency = 'USD'): string {
  return formatMoney(amount, currency);
}

export function formatCompactMoney(amount: number, currency = 'USD'): string {
  const symbol = currencySymbol(currency);
  if (Math.abs(amount) >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 1)}`;
}

export function currencySymbol(currency: string): string {
  try {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).formatToParts(0);
    const symbol = parts.find((p) => p.type === 'currency')?.value;
    return symbol || currency;
  } catch {
    return currency;
  }
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelative(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  if (url.startsWith('/demo/')) return url;
  return url;
}

export function resolveAbsoluteUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  if (url.startsWith('/') && SITE_URL) return `${SITE_URL}${url}`;
  return '';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const e = error as { response?: { data?: { detail?: unknown } }; message?: string };
    if (e.response?.data?.detail) {
      const detail = e.response.data.detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) {
        return detail
          .map((d) => (typeof d === 'object' && d && 'msg' in d ? String(d.msg) : String(d)))
          .join(', ');
      }
      return 'Something went wrong. Please try again.';
    }
    if (e.message) return e.message;
  }
  return 'Something went wrong. Please try again.';
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{3,9}$/.test(value);
}

export function toTitleCase(text: string): string {
  return text.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
