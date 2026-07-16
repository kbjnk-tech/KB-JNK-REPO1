import { useEffect, useState } from 'react'
import type { Transaction } from '@/entities/transaction'
import {
  deleteTransactionFromCloud,
  pullTransactionsFromCloud,
  upsertTransactionToCloud,
} from '@/features/sync-supabase'
import { ExchangePanel } from '@/widgets/exchange-panel'
import { RemittancePanel } from '@/widgets/remittance-panel'
import { TransactionHistoryPanel } from '@/widgets/transaction-history-panel'
import { loadTransactions, saveTransactions } from '@/shared/lib'
import { Tabs, ThemeToggle } from '@/shared/ui'

type CalcTab = 'exchange' | 'remittance'

export function DashboardPage() {
  const [tab, setTab] = useState<CalcTab>('exchange')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function boot() {
      setBooting(true)
      const remote = await pullTransactionsFromCloud()
      if (cancelled) return

      if (remote.ok) {
        setTransactions(remote.rows)
        saveTransactions(remote.rows)
        setStatusMessage(null)
      } else {
        const cached = loadTransactions()
        setTransactions(cached)
        setStatusMessage(
          `${remote.message} (캐시 ${cached.length}건으로 표시)`,
        )
      }
      setBooting(false)
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [])

  /** 화면 즉시 반영 + 캐시 백업 (주 저장은 Supabase) */
  function persistCache(next: Transaction[]) {
    setTransactions(next)
    saveTransactions(next)
  }

  async function handleSave(tx: Transaction) {
    persistCache([tx, ...transactions])
    const result = await upsertTransactionToCloud(tx)
    setStatusMessage(result.ok ? null : result.message)
  }

  async function handleDelete(id: string) {
    persistCache(transactions.filter((t) => t.id !== id))
    const result = await deleteTransactionFromCloud(id)
    setStatusMessage(result.ok ? null : result.message)
  }

  return (
    <main className="mx-auto min-h-svh max-w-5xl px-4 py-6 sm:py-8 text-left">
      <header className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-700 no-print">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              KB 외환 창구 도우미
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl dark:text-slate-100">
              대시보드
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              환전·해외송금 계산과 거래 기록을 한 화면에서 관리합니다. 기록의 주
              저장소는 Supabase이며, 연결 실패 시에만 localStorage 캐시로
              표시합니다.
            </p>
          </div>
          <ThemeToggle />
        </div>
        {booting ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400" role="status">
            클라우드에서 기록을 불러오는 중…
          </p>
        ) : statusMessage ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400" role="status">
            {statusMessage}
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-200 p-3 sm:p-4 dark:border-slate-700 no-print">
          <Tabs
            items={[
              { id: 'exchange', label: '환전' },
              { id: 'remittance', label: '해외송금' },
            ]}
            activeId={tab}
            onChange={(id) => setTab(id as CalcTab)}
          />
          {tab === 'exchange' ? (
            <ExchangePanel onSave={handleSave} />
          ) : (
            <RemittancePanel onSave={handleSave} />
          )}
        </div>

        <div className="rounded-lg border border-slate-200 p-3 sm:p-4 dark:border-slate-700 print-area">
          <TransactionHistoryPanel
            rows={transactions}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </main>
  )
}
