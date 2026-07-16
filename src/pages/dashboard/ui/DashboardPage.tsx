import { useEffect, useState } from 'react'
import type { Transaction } from '@/entities/transaction'
import {
  pullTransactionsFromCloud,
  pushTransactionsToCloud,
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

  useEffect(() => {
    setTransactions(loadTransactions())
  }, [])

  function persist(next: Transaction[]) {
    setTransactions(next)
    saveTransactions(next)
  }

  function handleSave(tx: Transaction) {
    persist([tx, ...transactions])
  }

  function handleDelete(id: string) {
    persist(transactions.filter((t) => t.id !== id))
  }

  async function handlePush() {
    setSyncing(true)
    const result = await pushTransactionsToCloud(transactions)
    setSyncMessage(result.message)
    setSyncing(false)
  }

  async function handlePull() {
    setSyncing(true)
    const result = await pullTransactionsFromCloud()
    setSyncMessage(result.message)
    if (result.ok) {
      persist(result.rows)
    }
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
              환전·해외송금 계산과 거래 기록을 한 화면에서 관리합니다. 기본 저장은
              localStorage이며, 가능하면 Supabase와 동기화할 수 있습니다.
            </p>
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500"
            onClick={handlePush}
            disabled={syncing}
          >
            클라우드로 동기화
          </Button>
          <Button
            type="button"
            className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-400"
            onClick={handlePull}
            disabled={syncing}
          >
            클라우드에서 불러오기
          </Button>
        </div>
        {syncMessage ? (
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
