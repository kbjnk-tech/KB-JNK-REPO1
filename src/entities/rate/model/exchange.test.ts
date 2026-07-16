import { describe, expect, it } from 'vitest'
import { CURRENCIES, getCurrencyUnit } from '@/entities/currency'
import {
  applyExchangeRate,
  calcRemittanceTotal,
  exchangeToKRW,
} from '@/entities/rate'
import {
  DEFAULT_CASH_SPREAD,
  DEFAULT_REMIT_SPREAD,
  getRemittanceFee,
  TELEGRAPHIC_FEE,
} from '@/shared/config'
import { formatKrw, formatRate, roundKrw, roundRate } from '@/shared/lib'

describe('currency units', () => {
  it('JPY unit is 100, others are 1', () => {
    expect(getCurrencyUnit('JPY')).toBe(100)
    expect(getCurrencyUnit('USD')).toBe(1)
    expect(CURRENCIES.EUR.unit).toBe(1)
    expect(CURRENCIES.CNY.unit).toBe(1)
  })
})

describe('shared/lib round & format', () => {
  it('rounds rate to 2 decimals and krw to int', () => {
    expect(roundRate(1566.954)).toBe(1566.95)
    expect(roundKrw(783475.4)).toBe(783475)
  })

  it('formats with comma and 원', () => {
    expect(formatKrw(783475)).toBe('783,475원')
    expect(formatRate(1566.95)).toBe('1,566.95')
  })
})

describe('getRemittanceFee', () => {
  it('matches PRD fee brackets', () => {
    expect(getRemittanceFee(500)).toBe(5_000)
    expect(getRemittanceFee(501)).toBe(10_000)
    expect(getRemittanceFee(2_000)).toBe(10_000)
    expect(getRemittanceFee(2_001)).toBe(15_000)
    expect(getRemittanceFee(5_000)).toBe(15_000)
    expect(getRemittanceFee(5_001)).toBe(20_000)
    expect(getRemittanceFee(20_000)).toBe(20_000)
    expect(getRemittanceFee(20_001)).toBe(25_000)
  })

  it('telegraphic fee is 8000', () => {
    expect(TELEGRAPHIC_FEE).toBe(8_000)
  })
})

describe('PRD acceptance — cash & wire rate', () => {
  it('① USD buy 0% → 1566.95 / 783,475', () => {
    const rate = applyExchangeRate(1540, DEFAULT_CASH_SPREAD, 0, 'buy')
    expect(rate).toBe(1566.95)
    expect(exchangeToKRW(500, rate, 1)).toBe(783_475)
  })

  it('② USD buy 80% → 1545.39 / 772,695', () => {
    const rate = applyExchangeRate(1540, DEFAULT_CASH_SPREAD, 80, 'buy')
    expect(rate).toBe(1545.39)
    expect(exchangeToKRW(500, rate, 1)).toBe(772_695)
  })

  it('③ USD sell 0% → 1513.05 / 756,525', () => {
    const rate = applyExchangeRate(1540, DEFAULT_CASH_SPREAD, 0, 'sell')
    expect(rate).toBe(1513.05)
    expect(exchangeToKRW(500, rate, 1)).toBe(756_525)
  })

  it('④ JPY buy 0% → 997.15 / 997,150', () => {
    const rate = applyExchangeRate(980, DEFAULT_CASH_SPREAD, 0, 'buy')
    expect(rate).toBe(997.15)
    expect(exchangeToKRW(100_000, rate, getCurrencyUnit('JPY'))).toBe(997_150)
  })

  it('⑤ USD wire 0% → 1555.40 / 1,555,400', () => {
    const rate = applyExchangeRate(1540, DEFAULT_REMIT_SPREAD, 0, 'buy')
    expect(rate).toBe(1555.4)
    expect(exchangeToKRW(1_000, rate, 1)).toBe(1_555_400)
  })

  it('preferential 100% → base rate / 770,000', () => {
    const rate = applyExchangeRate(1540, DEFAULT_CASH_SPREAD, 100, 'buy')
    expect(rate).toBe(1540)
    expect(exchangeToKRW(500, rate, 1)).toBe(770_000)
  })
})

describe('PRD acceptance — remittance total', () => {
  it('$3000 / B=1320 / P=0% → 4,022,600', () => {
    const result = calcRemittanceTotal(
      1320,
      DEFAULT_REMIT_SPREAD,
      0,
      3_000,
    )
    expect(result.appliedRate).toBe(1333.2)
    expect(result.principalKrw).toBe(3_999_600)
    expect(result.remittanceFee).toBe(15_000)
    expect(result.telegraphicFee).toBe(8_000)
    expect(result.totalKrw).toBe(4_022_600)
  })
})
