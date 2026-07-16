import type { Transaction } from '@/entities/transaction'
import { getSupabaseClient } from '@/shared/supabase'

export interface SyncResult {
  ok: boolean
  message: string
}

/** localStorage 주 + 가능 시 Supabase upsert (실패 시 안내만, 로컬 유지) */
export async function pushTransactionsToCloud(
  rows: Transaction[],
): Promise<SyncResult> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      ok: false,
      message: 'Supabase 환경변수가 없어 클라우드 동기화를 건너뜁니다.',
    }
  }

  try {
    const payload = rows.map((r) => ({
      id: r.id,
      customer_name: r.customerName,
      type: r.type,
      currency: r.currency,
      base_rate: r.baseRate,
      spread_rate: r.spreadRate,
      preferential_rate: r.preferentialRate,
      applied_rate: r.appliedRate,
      foreign_amount: r.foreignAmount,
      krw_amount: r.krwAmount,
      fee_total: r.feeTotal ?? null,
      memo: r.memo ?? null,
      created_at: r.createdAt,
    }))

    const { error } = await supabase.from('transactions').upsert(payload)
    if (error) {
      return {
        ok: false,
        message: `클라우드 동기화 실패: ${error.message}. 로컬 기록은 유지됩니다.`,
      }
    }
    return { ok: true, message: '클라우드에 동기화했습니다.' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return {
      ok: false,
      message: `클라우드 동기화 실패: ${msg}. 로컬 기록은 유지됩니다.`,
    }
  }
}

export async function pullTransactionsFromCloud(): Promise<{
  ok: boolean
  rows: Transaction[]
  message: string
}> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      ok: false,
      rows: [],
      message: 'Supabase 환경변수가 없습니다.',
    }
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return {
        ok: false,
        rows: [],
        message: `조회 실패: ${error.message}`,
      }
    }

    const rows: Transaction[] = (data ?? []).map((r) => ({
      id: r.id as string,
      customerName: r.customer_name as string,
      type: r.type as Transaction['type'],
      currency: r.currency as Transaction['currency'],
      baseRate: Number(r.base_rate),
      spreadRate: Number(r.spread_rate),
      preferentialRate: Number(r.preferential_rate),
      appliedRate: Number(r.applied_rate),
      foreignAmount: Number(r.foreign_amount),
      krwAmount: Number(r.krw_amount),
      feeTotal: r.fee_total != null ? Number(r.fee_total) : undefined,
      memo: (r.memo as string | null) ?? undefined,
      createdAt: r.created_at as string,
    }))

    return { ok: true, rows, message: '클라우드에서 불러왔습니다.' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return { ok: false, rows: [], message: `조회 실패: ${msg}` }
  }
}
