import { supabase } from '../../shared/supabaseClient'
import type { Transaction } from './types'

const SELECT = 'id, branch_id, status, subtotal, total, created_at, settled_at, transaction_items(id, name_snapshot, qty, price)'

interface TxnRow {
  id: string
  branch_id: string
  status: string
  subtotal: number
  total: number
  created_at: string
  settled_at: string | null
  transaction_items: { id: string; name_snapshot: string; qty: number; price: number }[] | null
}

function mapRow(r: TxnRow): Transaction {
  return {
    id: r.id,
    branchId: r.branch_id,
    status: r.status,
    subtotal: Number(r.subtotal),
    total: Number(r.total),
    createdAt: r.created_at,
    settledAt: r.settled_at,
    items: (r.transaction_items ?? []).map((i) => ({
      id: i.id,
      nameSnapshot: i.name_snapshot,
      qty: Number(i.qty),
      price: Number(i.price),
    })),
  }
}

// Port dari transactions_screen.dart: 50 transaksi terbaru untuk cabang ini.
export async function fetchRecentTransactions(branchId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select(SELECT)
    .eq('branch_id', branchId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []).map(mapRow)
}

// Port dari reports_screen.dart: transaksi sejak `fromIso`, tanpa batas atas,
// exclude void/refunded.
export async function fetchTransactionsSince(branchId: string, fromIso: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select(SELECT)
    .eq('branch_id', branchId)
    .gte('created_at', fromIso)
    .neq('status', 'void')
    .neq('status', 'refunded')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapRow)
}
