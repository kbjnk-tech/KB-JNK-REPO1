/** 원화 표시: 천단위 콤마 + `원` */
export function formatKrw(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`
}

/** 환율 표시: 소수 2자리 + 천단위 콤마 */
export function formatRate(rate: number): string {
  return rate.toLocaleString('ko-KR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
