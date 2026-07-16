import { useEffect, useState } from 'react'
import type { Transaction } from '@/entities/transaction'
import {
  deleteTransactionFromCloud,
  pullTransactionsFromCloud,
  pushTransactionsToCloud,
  upsertTransactionToCloud,
} from '@/features/sync-supabase'
import { ExchangePanel } from '@/widgets/exchange-panel'
import { RemittancePanel } from '@/widgets/remittance-panel'
import { TransactionHistoryPanel } from '@/widgets/transaction-history-panel'
import { loadTransactions, saveTransactions } from '@/shared/lib'
import { Button, Tabs, ThemeToggle } from '@/shared/ui'

type CalcTab = 'exchange' | 'remittance'

export function DashboardPage() {
  const [tab, setTab] = useState<CalcTab>('exchange')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
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
        setSyncMessage(remote.message)
      } else {
        const cached = loadTransactions()
        setTransactions(cached)
        setSyncMessage(
          `${remote.message} (캐시 ${cached.length}건 · env/테이블을 확인하세요.)`,
        )
      }
      setBooting(false)
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [])

  /** 화면 + localStorage 캐시 즉시 반영 (주 저장소 실패해도 오프라인 사용) */
  function persistCache(next: Transaction[]) {
    setTransactions(next)
    saveTransactions(next)
  }

  async function handleSave(tx: Transaction) {
    const next = [tx, ...transactions]
    persistCache(next)
    const result = await upsertTransactionToCloud(tx)
    setSyncMessage(
      result.ok
        ? result.message
        : `${result.message} 여러 기기에서는 마지막 쓰기가 남을 수 있습니다.`,
    )
  }

  async function handleDelete(id: string) {
    const next = transactions.filter((t) => t.id !== id)
    persistCache(next)
    const result = await deleteTransactionFromCloud(id)
    setSyncMessage(result.message)
  }

  async function handleRefreshFromCloud() {
    setSyncing(true)
    const result = await pullTransactionsFromCloud()
    if (result.ok) {
      persistCache(result.rows)
      setSyncMessage(result.message)
    } else {
      setSyncMessage(result.message)
    }
    setSyncing(false)
  }

  async function handleReuploadCache() {
    setSyncing(true)
    const result = await pushTransactionsToCloud(transactions)
    setSyncMessage(result.message)
    setSyncing(false)
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
              환전·해외송금 계산과 거래 기록을 한 화면에서 관리합니다. 주 저장소는
              Supabase이며, 실패·오프라인 시 localStorage 캐시로 계속 사용할 수
              있습니다. 여러 기기에서는 마지막 쓰기가 남을 수 있습니다.
            </p>
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500"
            onClick={handleRefreshFromCloud}
            disabled={syncing || booting}
          >
            클라우드에서 새로고침
          </Button>
          <Button
            type="button"
            className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-400"
            onClick={handleReuploadCache}
            disabled={syncing || booting}
          >
            캐시 재업로드
          </Button>
        </div>
        {booting ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400" role="status">
            클라우드에서 기록을 불러오는 중…
          </p>
        ) : syncMessage ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400" role="status">
            {syncMessage}
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
