export type CurrencyCode = 'USD' | 'JPY' | 'EUR' | 'CNY'

export interface CurrencyConfig {
  code: CurrencyCode
  unit: number
  label: string
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', unit: 1, label: '미국 달러' },
  JPY: { code: 'JPY', unit: 100, label: '일본 엔 (100엔당)' },
  EUR: { code: 'EUR', unit: 1, label: '유로' },
  CNY: { code: 'CNY', unit: 1, label: '중국 위안' },
}

export const CURRENCY_LIST: CurrencyConfig[] = Object.values(CURRENCIES)

export function getCurrencyUnit(code: CurrencyCode): number {
  return CURRENCIES[code].unit
}
