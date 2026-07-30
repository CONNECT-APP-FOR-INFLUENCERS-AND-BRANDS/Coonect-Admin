import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  const value = amount ?? 0
  if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(2)}L`
  if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(1)}K`
  return `₹${value.toFixed(0)}`
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch {
    return iso
  }
}

export function titleCase(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .split('_')
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ')
}
