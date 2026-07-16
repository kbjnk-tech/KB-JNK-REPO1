export type TransactionType = 'buy' | 'sell' | 'remit'

/** entities/currency의 CurrencyCode와 동일 유니온 (동일 레이어 import 금지로 인라인) */
export type TransactionCurrency = 'USD' | 'JPY' | 'EUR' | 'CNY'

export interface Transaction {
  id: string
  customerName: string
  type: TransactionType
  currency: TransactionCurrency
  baseRate: number
  spreadRate: number
  preferentialRate: number
  appliedRate: number
  foreignAmount: number
  krwAmount: number
  /** 송금 시: 수수료+전신료 포함 총액 등 */
  feeTotal?: number
  memo?: string
  createdAt: string
}
