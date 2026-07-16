import {
  applyExchangeRate,
  exchangeToKRW,
  type TradeSide,
} from '@/entities/rate'
import { getCurrencyUnit, type CurrencyCode } from '@/entities/currency'

export interface ExchangeInput {
  currency: CurrencyCode
  side: TradeSide
  baseRate: number
  spreadRate: number
  preferentialRate: number
  foreignAmount: number
}

export interface ExchangeResult {
  ok: true
  appliedRate: number
  krwAmount: number
}

export interface ExchangeError {
  ok: false
  message: string
}

export type ExchangeCalc = ExchangeResult | ExchangeError

function isValidNumber(n: number): boolean {
  return Number.isFinite(n) && n > 0
}

/** 우대율 0~100으로 클램프 */
export function clampPreferential(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

export function calculateExchange(input: ExchangeInput): ExchangeCalc {
  const { baseRate, foreignAmount, spreadRate, preferentialRate, side, currency } =
    input

  if (!isValidNumber(baseRate) || !isValidNumber(foreignAmount)) {
    return {
      ok: false,
      message: '매매기준율과 외화 금액은 0보다 큰 숫자여야 합니다.',
    }
  }
  if (!Number.isFinite(spreadRate) || spreadRate < 0) {
    return { ok: false, message: '스프레드율을 확인해주세요.' }
  }

  const pref = clampPreferential(preferentialRate)
  const appliedRate = applyExchangeRate(baseRate, spreadRate, pref, side)
  const krwAmount = exchangeToKRW(
    foreignAmount,
    appliedRate,
    getCurrencyUnit(currency),
  )

  return { ok: true, appliedRate, krwAmount }
}
