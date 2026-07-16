import type { Transaction } from '@/entities/transaction'

export function validateNewTransaction(
  partial: Pick<Transaction, 'customerName' | 'foreignAmount' | 'currency'>,
): string | null {
  if (!partial.customerName.trim()) {
    return '고객명을 입력해주세요.'
  }
  if (!Number.isFinite(partial.foreignAmount) || partial.foreignAmount <= 0) {
    return '금액이 올바르지 않습니다.'
  }
  if (!partial.currency) {
    return '통화를 선택해주세요.'
  }
  return null
}

export function createTransactionId(): string {
  return crypto.randomUUID()
}
