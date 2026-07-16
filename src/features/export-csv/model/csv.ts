import type { Transaction } from '@/entities/transaction'

const TYPE_LABEL: Record<Transaction['type'], string> = {
  buy: '현찰 살 때',
  sell: '현찰 팔 때',
  remit: '해외송금',
}

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function transactionsToCsv(rows: Transaction[]): string {
  const header = [
    '고객명',
    '거래구분',
    '통화',
    '매매기준율',
    '스프레드율',
    '우대율',
    '적용환율',
    '외화금액',
    '원화금액',
    '수수료합계',
    '메모',
    '등록일시',
  ]
  const lines = rows.map((r) =>
    [
      r.customerName,
      TYPE_LABEL[r.type],
      r.currency,
      String(r.baseRate),
      String(r.spreadRate),
      String(r.preferentialRate),
      String(r.appliedRate),
      String(r.foreignAmount),
      String(r.krwAmount),
      r.feeTotal != null ? String(r.feeTotal) : '',
      r.memo ?? '',
      r.createdAt,
    ]
      .map(escapeCsv)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}

/** UTF-8 BOM + CSV 다운로드 */
export function downloadTransactionsCsv(
  rows: Transaction[],
  filename = 'transactions.csv',
): void {
  const csv = '\uFEFF' + transactionsToCsv(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
