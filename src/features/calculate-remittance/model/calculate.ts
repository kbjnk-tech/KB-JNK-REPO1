import { calcRemittanceTotal } from '@/entities/rate'
import { DEFAULT_REMIT_SPREAD } from '@/shared/config'

export interface RemittanceInput {
  baseRate: number
  spreadRate?: number
  preferentialRate: number
  foreignAmountUsd: number
}

export interface RemittanceOk {
  ok: true
  appliedRate: number
  principalKrw: number
  remittanceFee: number
  telegraphicFee: number
  totalKrw: number
}

export interface RemittanceErr {
  ok: false
  message: string
}

export type RemittanceCalc = RemittanceOk | RemittanceErr

export function calculateRemittance(input: RemittanceInput): RemittanceCalc {
  const {
    baseRate,
    preferentialRate,
    foreignAmountUsd,
    spreadRate = DEFAULT_REMIT_SPREAD,
  } = input

  if (
    !Number.isFinite(baseRate) ||
    baseRate <= 0 ||
    !Number.isFinite(foreignAmountUsd) ||
    foreignAmountUsd <= 0
  ) {
    return {
      ok: false,
      message: '매매기준율과 송금액(USD)은 0보다 큰 숫자여야 합니다.',
    }
  }

  const pref = Number.isFinite(preferentialRate)
    ? Math.min(100, Math.max(0, preferentialRate))
    : 0

  const result = calcRemittanceTotal(
    baseRate,
    spreadRate,
    pref,
    foreignAmountUsd,
  )

  return { ok: true, ...result }
}
