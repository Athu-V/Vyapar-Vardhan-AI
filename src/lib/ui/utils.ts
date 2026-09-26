import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { type AppLanguageCode } from "../i18n/languages"
import { fin } from "../i18n/messages"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency in Indian numbering system.
 * Compact mode shows lakhs/crores shorthand (e.g., ₹2.5L, ₹1.2Cr).
 *
 * The returned value always carries the base INR string, while financial
 * term wrappers are handled separately by the i18n layer.
 */
export function formatINR(amount: number, compact: boolean = false): string {
  if (compact) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
  }
  return `₹${amount.toLocaleString("en-IN")}`
}

/**
 * Financial term wrapper.
 *
 * Returns the English term for English, and the local word + English in
 * brackets for Indian languages.
 */
export function financialTerm(
  englishTerm: string,
  code: AppLanguageCode,
  localWord: string
): string {
  return fin(englishTerm, code, localWord)
}
