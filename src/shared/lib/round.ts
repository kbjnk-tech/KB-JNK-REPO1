/** 적용환율: 소수점 2자리 반올림 */
export function roundRate(value: number): number {
  return Math.round(value * 100) / 100
}

/** 원화: 정수 반올림 */
export function roundKrw(value: number): number {
  return Math.round(value)
}
