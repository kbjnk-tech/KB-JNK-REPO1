import type { Transaction } from '@/entities/transaction'

export function searchTransactions(
  rows: Transaction[],
  keyword: string,
): Transaction[] {
  const q = keyword.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((row) => {
    const hay = `${row.customerName} ${row.currency} ${row.memo ?? ''}`.toLowerCase()
    return hay.includes(q)
  })
}
