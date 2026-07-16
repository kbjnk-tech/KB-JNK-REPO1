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

/** 단건 upsert — (선택) Supabase 반영. 미설정 시 localStorage만 사용 */
export async function upsertTransactionToCloud(
  row: Transaction,
): Promise<SyncResult> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { ok: true, message: '' }
  }

  try {
    const { error } = await supabase.from('transactions').upsert(toRow(row))
    if (error) {
      return {
        ok: false,
        message: `클라우드 저장 실패: ${error.message}. localStorage에는 저장되어 있습니다.`,
      }
    }
    return { ok: true, message: '' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return {
      ok: false,
      message: `클라우드 저장 실패: ${msg}. localStorage에는 저장되어 있습니다.`,
    }
  }
}

/** 단건 삭제 — (선택) Supabase 반영. 미설정 시 localStorage만 사용 */
export async function deleteTransactionFromCloud(
  id: string,
): Promise<SyncResult> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { ok: true, message: '' }
  }

  try {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      return {
        ok: false,
        message: `클라우드 삭제 실패: ${error.message}. localStorage에는 반영되어 있습니다.`,
      }
    }
    return { ok: true, message: '' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return {
      ok: false,
      message: `클라우드 삭제 실패: ${msg}. localStorage에는 반영되어 있습니다.`,
    }
  }
}

/** (선택) Supabase에서 조회. 미설정·실패 시 호출측이 localStorage를 사용 */
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
      message: '',
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
        message: `클라우드 조회 실패: ${error.message}. localStorage 기록을 표시합니다.`,
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
      message: `클라우드 조회 실패: ${msg}. localStorage 기록을 표시합니다.`,
    }
  }
}
