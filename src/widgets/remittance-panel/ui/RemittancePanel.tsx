import { useMemo, useState } from 'react'
import type { Transaction } from '@/entities/transaction'
import { calculateRemittance } from '@/features/calculate-remittance'
import { createTransactionId, validateNewTransaction } from '@/features/add-transaction'
import { fetchBaseRate } from '@/shared/api'
import { DEFAULT_REMIT_SPREAD } from '@/shared/config'
import { formatKrw, formatRate } from '@/shared/lib'
import { Button, Input } from '@/shared/ui'

interface Props {
  onSave: (tx: Transaction) => void
}

export function RemittancePanel({ onSave }: Props) {
  const [baseRate, setBaseRate] = useState('')
  const [spreadRate, setSpreadRate] = useState(String(DEFAULT_REMIT_SPREAD))
  const [preferentialRate, setPreferentialRate] = useState('0')
  const [foreignAmount, setForeignAmount] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [memo, setMemo] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [apiLoading, setApiLoading] = useState(false)

  const calc = useMemo(
    () =>
      calculateRemittance({
        baseRate: Number(baseRate),
        spreadRate: Number(spreadRate),
        preferentialRate: Number(preferentialRate),
        foreignAmountUsd: Number(foreignAmount),
      }),
    [baseRate, spreadRate, preferentialRate, foreignAmount],
  )

  async function handleFetchRate() {
    setApiLoading(true)
    setMessage(null)
    try {
      const rate = await fetchBaseRate('USD')
      setBaseRate(String(rate))
      setMessage('실시간 매매기준율을 불러왔습니다.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : '환율 API 호출에 실패했습니다.'
      setMessage(`${msg} 수동으로 입력해주세요.`)
    } finally {
      setApiLoading(false)
    }
  }

  function handleSave() {
    if (!calc.ok) return
    const err = validateNewTransaction({
      customerName,
      foreignAmount: Number(foreignAmount),
      currency: 'USD',
    })
    if (err) {
      setMessage(err)
      return
    }
    onSave({
      id: createTransactionId(),
      customerName: customerName.trim(),
      type: 'remit',
      currency: 'USD',
      baseRate: Number(baseRate),
      spreadRate: Number(spreadRate),
      preferentialRate: Number(preferentialRate),
      appliedRate: calc.appliedRate,
      foreignAmount: Number(foreignAmount),
      krwAmount: calc.principalKrw,
      feeTotal: calc.totalKrw,
      memo: memo.trim() || undefined,
      createdAt: new Date().toISOString(),
    })
    setCustomerName('')
    setMemo('')
    setMessage('송금 기록이 추가되었습니다.')
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        해외송금 비용 계산
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        전신환 스프레드 기본 {DEFAULT_REMIT_SPREAD}% · 수수료는 shared/config 기준
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1 basis-full sm:basis-auto sm:min-w-[12rem]">
            <Input
              label="매매기준율"
              inputMode="decimal"
              value={baseRate}
              onChange={(e) => setBaseRate(e.target.value.replace(/[^0-9.]/g, ''))}
            />
          </div>
          <Button type="button" onClick={handleFetchRate} disabled={apiLoading}>
            {apiLoading ? '조회 중…' : '실시간 환율 (USD)'}
          </Button>
        </div>
        <Input
          label="전신환 스프레드 (%)"
          value={spreadRate}
          onChange={(e) => setSpreadRate(e.target.value.replace(/[^0-9.]/g, ''))}
        />
        <Input
          label="우대율 (%)"
          value={preferentialRate}
          onChange={(e) =>
            setPreferentialRate(e.target.value.replace(/[^0-9.]/g, ''))
          }
        />
        <Input
          label="송금액 (USD)"
          value={foreignAmount}
          onChange={(e) =>
            setForeignAmount(e.target.value.replace(/[^0-9.]/g, ''))
          }
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

      <div className="space-y-1 rounded-md bg-slate-50 p-4 text-sm dark:bg-slate-800/80">
        {calc.ok ? (
          <>
            <p>
              적용환율: <strong>{formatRate(calc.appliedRate)}</strong>
            </p>
            <p>
              송금원금(원화): <strong>{formatKrw(calc.principalKrw)}</strong>
            </p>
            <p>
              송금수수료: <strong>{formatKrw(calc.remittanceFee)}</strong>
            </p>
            <p>
              전신료: <strong>{formatKrw(calc.telegraphicFee)}</strong>
            </p>
            <p className="pt-1 text-base">
              총 출금액:{' '}
              <strong className="text-amber-900 dark:text-amber-300">
                {formatKrw(calc.totalKrw)}
              </strong>
            </p>
          </>
        ) : (
          <p className="text-amber-800 dark:text-amber-300">{calc.message}</p>
        )}
      </div>

      {message ? (
        <p className="text-sm text-slate-600 dark:text-slate-400" role="status">
          {message}
        </p>
      ) : null}

      <Button type="button" onClick={handleSave} disabled={!calc.ok}>
        계산 결과로 기록 추가
      </Button>
    </section>
  )
}
