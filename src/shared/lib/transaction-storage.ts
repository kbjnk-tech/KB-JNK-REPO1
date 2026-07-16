import type { Transaction } from '@/entities/transaction'

const STORAGE_KEY = 'fx-teller-transactions'

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Transaction[]) : []
  } catch {
    return []
  }
}

export function saveTransactions(rows: Transaction[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}
