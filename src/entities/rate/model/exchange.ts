import { roundKrw, roundRate } from '@/shared/lib'
import { getRemittanceFee, TELEGRAPHIC_FEE } from '@/shared/config'

export type TradeSide = 'buy' | 'sell'

/**
 * 적용환율 (소수 2자리 반올림 고정)
 * 살 때: B × (1 + (S/100)×(1−P/100))
 * 팔 때: B × (1 − (S/100)×(1−P/100))
 */
export function applyExchangeRate(
  baseRate: number,
  spreadPercent: number,
  preferentialPercent: number,
  side: TradeSide,
): number {
  const effectiveSpread =
    (spreadPercent / 100) * (1 - preferentialPercent / 100)
  const raw =
    side === 'buy'
      ? baseRate * (1 + effectiveSpread)
      : baseRate * (1 - effectiveSpread)
  return roundRate(raw)
}

/** 원화 = round(외화금액 ÷ unit × 적용환율) */
export function exchangeToKRW(
  foreignAmount: number,
  appliedRate: number,
  unit: number,
): number {
  return roundKrw((foreignAmount / unit) * appliedRate)
}

export interface RemittanceBreakdown {
  appliedRate: number
  principalKrw: number
  remittanceFee: number
  telegraphicFee: number
  totalKrw: number
}

/**
 * 전신환 송금 총 출금액
 * 적용환율은 살 때(매도) 공식 + 전신환 스프레드
 */
export function calcRemittanceTotal(
  baseRate: number,
  spreadPercent: number,
  preferentialPercent: number,
  foreignAmountUsd: number,
  unit = 1,
): RemittanceBreakdown {
  const appliedRate = applyExchangeRate(
    baseRate,
    spreadPercent,
    preferentialPercent,
    'buy',
  )
  const principalKrw = exchangeToKRW(foreignAmountUsd, appliedRate, unit)
  const remittanceFee = getRemittanceFee(foreignAmountUsd)
  const telegraphicFee = TELEGRAPHIC_FEE
  return {
    appliedRate,
    principalKrw,
    remittanceFee,
    telegraphicFee,
    totalKrw: principalKrw + remittanceFee + telegraphicFee,
  }
}
