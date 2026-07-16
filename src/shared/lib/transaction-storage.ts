/**
 * localStorage 영속화 스키마.
 * entities Transaction과 구조 동일 — shared→entities 역의존 방지를 위해 인라인.
 */
export interface StoredTransaction {
  id: string
  customerName: string
  type: 'buy' | 'sell' | 'remit'
  currency: 'USD' | 'JPY' | 'EUR' | 'CNY'
  baseRate: number
  spreadRate: number
  preferentialRate: number
  appliedRate: number
  foreignAmount: number
  krwAmount: number
  feeTotal?: number
  memo?: string
  createdAt: string
}

const STORAGE_KEY = 'fx-teller-transactions'

export function loadTransactions(): StoredTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StoredTransaction[]) : []
  } catch {
    return []
  }
}

export function saveTransactions(rows: StoredTransaction[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}
