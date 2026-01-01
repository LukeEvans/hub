import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parses a date string.
 * If the string is a date-only format (YYYY-MM-DD), it parses it in the local timezone
 * to avoid UTC-related day-shifting issues.
 */
export function parseSafeDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  
  // Check if it's a date-only string (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  
  return new Date(dateStr)
}
