import { useEffect, useMemo, useState } from 'react'
import { CURRENCY_LIST, type CurrencyCode } from '@/entities/currency'
import type { TradeSide } from '@/entities/rate'
import type { Transaction } from '@/entities/transaction'
import { calculateExchange } from '@/features/calculate-exchange'
import { createTransactionId, validateNewTransaction } from '@/features/add-transaction'
import { fetchBaseRate } from '@/shared/api'
import { DEFAULT_CASH_SPREAD } from '@/shared/config'
import { formatKrw, formatRate } from '@/shared/lib'
import { Button, Input, Select } from '@/shared/ui'

function parsePositiveNumber(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  const n = Number(cleaned)
  return n
}

interface Props {
  onSave: (tx: Transaction) => void
}

export function ExchangePanel({ onSave }: Props) {
  const [currency, setCurrency] = useState<CurrencyCode>('USD')
  const [side, setSide] = useState<TradeSide>('buy')
  const [baseRate, setBaseRate] = useState('')
  const [spreadRate, setSpreadRate] = useState(String(DEFAULT_CASH_SPREAD))
  const [preferentialRate, setPreferentialRate] = useState('0')
  const [foreignAmount, setForeignAmount] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [memo, setMemo] = useState('')
  const [apiMessage, setApiMessage] = useState<string | null>(null)
  const [apiLoading, setApiLoading] = useState(false)

  const calc = useMemo(() => {
    return calculateExchange({
      currency,
      side,
      baseRate: parsePositiveNumber(baseRate),
      spreadRate: Number(spreadRate),
      preferentialRate: Number(preferentialRate),
      foreignAmount: parsePositiveNumber(foreignAmount),
    })
  }, [currency, side, baseRate, spreadRate, preferentialRate, foreignAmount])

  async function handleFetchRate() {
    setApiLoading(true)
    setApiMessage(null)
    try {
      const rate = await fetchBaseRate(currency)
      setBaseRate(String(rate))
      setApiMessage('실시간 매매기준율을 불러왔습니다.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : '환율 API 호출에 실패했습니다.'
      setApiMessage(`${msg} 수동으로 입력해주세요.`)
    } finally {
      setApiLoading(false)
    }
  }

  useEffect(() => {
    setApiMessage(null)
  }, [currency])

  function handleSave() {
    if (!calc.ok) return
    const err = validateNewTransaction({
      customerName,
      foreignAmount: parsePositiveNumber(foreignAmount),
      currency,
    })
    if (err) {
      setApiMessage(err)
      return
    }
    const tx: Transaction = {
      id: createTransactionId(),
      customerName: customerName.trim(),
      type: side,
      currency,
      baseRate: parsePositiveNumber(baseRate),
      spreadRate: Number(spreadRate),
      preferentialRate: Number(preferentialRate),
      appliedRate: calc.appliedRate,
      foreignAmount: parsePositiveNumber(foreignAmount),
      krwAmount: calc.krwAmount,
      memo: memo.trim() || undefined,
      createdAt: new Date().toISOString(),
    }
    onSave(tx)
    setCustomerName('')
    setMemo('')
    setApiMessage('거래 기록이 추가되었습니다.')
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        환전 계산기
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="통화"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        >
          {CURRENCY_LIST.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.label}
            </option>
          ))}
        </Select>
        <Select
          label="거래 구분"
          value={side}
          onChange={(e) => setSide(e.target.value as TradeSide)}
        >
          <option value="buy">현찰 살 때</option>
          <option value="sell">현찰 팔 때</option>
        </Select>
        <div className="sm:col-span-2 flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1 basis-full sm:basis-auto sm:min-w-[12rem]">
            <Input
              label="매매기준율"
              inputMode="decimal"
              value={baseRate}
              onChange={(e) => setBaseRate(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="예: 1540"
            />
          </div>
          <Button type="button" onClick={handleFetchRate} disabled={apiLoading}>
            {apiLoading ? '조회 중…' : '실시간 환율'}
          </Button>
        </div>
        <Input
          label="스프레드율 (%)"
          inputMode="decimal"
          value={spreadRate}
          onChange={(e) => setSpreadRate(e.target.value.replace(/[^0-9.]/g, ''))}
        />
        <Input
          label="우대율 (%)"
          inputMode="decimal"
          value={preferentialRate}
          onChange={(e) =>
            setPreferentialRate(e.target.value.replace(/[^0-9.]/g, ''))
          }
        />
        <Input
          label="외화 금액"
          inputMode="decimal"
          value={foreignAmount}
          onChange={(e) =>
            setForeignAmount(e.target.value.replace(/[^0-9.]/g, ''))
          }
          placeholder="예: 500"
        />
        <Input
          label="고객명 (기록용)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <div className="sm:col-span-2">
          <Input
            label="메모 (선택)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md bg-slate-50 p-4 text-sm dark:bg-slate-800/80">
        {calc.ok ? (
          <>
            <p>
              적용환율:{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {formatRate(calc.appliedRate)}
              </strong>
            </p>
            <p className="mt-1">
              원화 금액:{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {formatKrw(calc.krwAmount)}
              </strong>
            </p>
          </>
        ) : (
          <p className="text-amber-800 dark:text-amber-300">{calc.message}</p>
        )}
      </div>

      {apiMessage ? (
        <p className="text-sm text-slate-600 dark:text-slate-400" role="status">
          {apiMessage}
        </p>
      ) : null}

      <Button type="button" onClick={handleSave} disabled={!calc.ok}>
        계산 결과로 기록 추가
      </Button>
    </section>
  )
}
