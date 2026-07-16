/** API 통화 코드 (entities CurrencyCode와 동일 유니온 — shared→entities 역의존 방지) */
export type ApiCurrencyCode = 'USD' | 'JPY' | 'EUR' | 'CNY'

interface EximRow {
  cur_unit?: string
  CUR_UNIT?: string
  deal_bas_r?: string
  DEAL_BAS_R?: string
  result?: number
  RESULT?: number
}

function parseRate(raw: string): number {
  return Number(raw.replace(/,/g, ''))
}

function mapCurrencyUnit(code: ApiCurrencyCode): string {
  if (code === 'JPY') return 'JPY(100)'
  return code
}

/**
 * 한국수출입은행 현재환율 API
 * 개발: Vite proxy `/api/exim` · 키 없거나 실패 시 throw → UI fallback
 */
export async function fetchBaseRate(currency: ApiCurrencyCode): Promise<number> {
  const key = import.meta.env.VITE_EXCHANGE_API_KEY as string | undefined
  if (!key) {
    throw new Error('환율 API 키가 없습니다 (.env의 VITE_EXCHANGE_API_KEY).')
  }

  const params = new URLSearchParams({
    authkey: key,
    data: 'AP01',
  })

  const url = `/api/exim/exchangeJSON?${params.toString()}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`환율 API HTTP ${res.status}`)
  }

  const data: unknown = await res.json()
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('환율 데이터가 비어 있습니다. (비영업일·조기 조회 가능)')
  }

  const target = mapCurrencyUnit(currency)
  const row = (data as EximRow[]).find((item) => {
    const unit = item.CUR_UNIT ?? item.cur_unit
    return unit === target || unit === currency
  })

  if (!row) {
    throw new Error(`${currency} 환율을 찾지 못했습니다.`)
  }

  const raw = row.DEAL_BAS_R ?? row.deal_bas_r
  if (!raw) {
    throw new Error('매매기준율 필드가 없습니다.')
  }

  const rate = parseRate(raw)
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('매매기준율 파싱에 실패했습니다.')
  }
  return rate
}
