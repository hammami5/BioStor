'use client';

import type { CSSProperties } from 'react';
import type { ButtonStyle, StoreSettings } from '@/types';

export function buttonRadius(style?: ButtonStyle): string {
  if (style === 'pill') return '9999px';
  if (style === 'square') return '4px';
  return '12px';
}

export function accentButton(settings?: StoreSettings): CSSProperties {
  return {
    background: settings?.accent_color || '#d4af37',
    color: isLightColor(settings?.accent_color || '#d4af37') ? '#000' : '#fff',
    borderRadius: buttonRadius(settings?.button_style),
  };
}

export function accentText(settings?: StoreSettings): CSSProperties {
  return { color: settings?.accent_color || '#d4af37' };
}

export function isLightColor(hex: string): boolean {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const int = parseInt(full.slice(0, 6), 16);
  if (isNaN(int)) return false;
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
