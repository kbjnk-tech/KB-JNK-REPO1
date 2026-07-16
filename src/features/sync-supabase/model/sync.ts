import type { Transaction } from '@/entities/transaction'
import { getSupabaseClient } from '@/shared/supabase'

export interface SyncResult {
  ok: boolean
  message: string
}

function toRow(r: Transaction) {
  return {
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
  }
}

function fromRow(r: Record<string, unknown>): Transaction {
  return {
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
  }
}

/** 단건 upsert — 주 저장소(Supabase) 반영 */
export async function upsertTransactionToCloud(
  row: Transaction,
): Promise<SyncResult> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      ok: false,
      message:
        'Supabase 환경변수가 없습니다. 주 저장소에 쓰지 못했고 localStorage 캐시만 갱신했습니다.',
    }
  }

  try {
    const { error } = await supabase.from('transactions').upsert(toRow(row))
    if (error) {
      return {
        ok: false,
        message: `클라우드 저장 실패: ${error.message}. localStorage 캐시는 갱신됩니다.`,
      }
    }
    return { ok: true, message: '' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return {
      ok: false,
      message: `클라우드 저장 실패: ${msg}. localStorage 캐시는 갱신됩니다.`,
    }
  }
}

/** 단건 삭제 — 주 저장소(Supabase) 반영 */
export async function deleteTransactionFromCloud(
  id: string,
): Promise<SyncResult> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      ok: false,
      message:
        'Supabase 환경변수가 없습니다. 주 저장소에서 삭제하지 못했고 localStorage 캐시만 갱신했습니다.',
    }
  }

  try {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      return {
        ok: false,
        message: `클라우드 삭제 실패: ${error.message}. localStorage 캐시는 갱신됩니다.`,
      }
    }
    return { ok: true, message: '' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return {
      ok: false,
      message: `클라우드 삭제 실패: ${msg}. localStorage 캐시는 갱신됩니다.`,
    }
  }
}

/** 주 저장소(Supabase)에서 조회. 실패 시 호출측이 localStorage 캐시 사용 */
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
      message:
        'Supabase 환경변수가 없습니다. 주 저장소 대신 localStorage 캐시를 사용합니다.',
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
        message: `클라우드 조회 실패: ${error.message}. localStorage 캐시를 사용합니다.`,
      }
    }

    const rows = (data ?? []).map((r) => fromRow(r as Record<string, unknown>))
    return {
      ok: true,
      rows,
      message: '',
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return {
      ok: false,
      rows: [],
      message: `클라우드 조회 실패: ${msg}. localStorage 캐시를 사용합니다.`,
    }
  }
}
