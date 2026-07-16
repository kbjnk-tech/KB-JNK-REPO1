import { useMemo, useState } from 'react'
import type { Transaction } from '@/entities/transaction'
import { searchTransactions } from '@/features/search-transaction'
import { downloadTransactionsCsv } from '@/features/export-csv'
import { formatKrw, formatRate } from '@/shared/lib'
import { Button, Input } from '@/shared/ui'

interface Props {
  rows: Transaction[]
  onDelete: (id: string) => void
}

const TYPE_LABEL: Record<Transaction['type'], string> = {
  buy: '현찰 살 때',
  sell: '현찰 팔 때',
  remit: '해외송금',
}

export function TransactionHistoryPanel({ rows, onDelete }: Props) {
  const [keyword, setKeyword] = useState('')
  const filtered = useMemo(
    () => searchTransactions(rows, keyword),
    [rows, keyword],
  )

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          거래 기록
        </h2>
        <div className="flex flex-wrap gap-2 no-print">
          <Button
            type="button"
            className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500"
            onClick={() => window.print()}
            disabled={filtered.length === 0}
          >
            인쇄
          </Button>
          <Button
            type="button"
            className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500"
            onClick={() => downloadTransactionsCsv(filtered)}
            disabled={filtered.length === 0}
          >
            CSV 내보내기
          </Button>
        </div>
      </div>
      <div className="no-print">
        <Input
          label="검색 (고객명·통화·메모)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="키워드 입력"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          표시할 기록이 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-md border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
          {filtered.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-start justify-between gap-3 p-3 text-sm"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {row.customerName} · {row.currency} · {TYPE_LABEL[row.type]}
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  {row.foreignAmount.toLocaleString('ko-KR')} / 적용{' '}
                  {formatRate(row.appliedRate)} →{' '}
                  {formatKrw(row.feeTotal ?? row.krwAmount)}
                </p>
                {row.memo ? (
                  <p className="mt-1 text-slate-500 dark:text-slate-500">
                    메모: {row.memo}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {new Date(row.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
              <Button
                type="button"
                className="bg-rose-700 hover:bg-rose-800 no-print dark:bg-rose-600 dark:hover:bg-rose-500"
                onClick={() => onDelete(row.id)}
              >
                삭제
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
