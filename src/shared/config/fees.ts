/** 현찰 스프레드 기본 (%) */
export const DEFAULT_CASH_SPREAD = 1.75

/** 전신환(송금) 스프레드 기본 (%) */
export const DEFAULT_REMIT_SPREAD = 1.0

/** 전신료 (원/건) */
export const TELEGRAPHIC_FEE = 8_000

/** 송금액(USD) 구간별 송금수수료 (원) — PRD/README와 동일 소스 */
export function getRemittanceFee(usdAmount: number): number {
  if (usdAmount <= 500) return 5_000
  if (usdAmount <= 2_000) return 10_000
  if (usdAmount <= 5_000) return 15_000
  if (usdAmount <= 20_000) return 20_000
  return 25_000
}
