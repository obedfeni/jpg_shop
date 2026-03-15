import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export function validateGhanaPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '');
  return /^(0)(20|23|24|25|26|27|28|50|54|55|56|57|59)\d{7}$/.test(cleaned);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>'"&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '&': '&amp;' }[c] || c));
}

export function generateReference(productName: string, location: string): string {
  const pc = productName.slice(0, 3).toUpperCase().padEnd(3, 'X');
  const lc = location.slice(0, 3).toUpperCase().padEnd(3, 'LOC');
  const r = Math.floor(1000 + Math.random() * 9000);
  return `JPG-${pc}-${lc}-${r}`;
}
