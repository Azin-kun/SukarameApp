import { create } from 'zustand'
import { supabase } from '../../shared/supabaseClient'
import { getErrorMessage } from '../../shared/errors'
import type { CartItem, CatalogItem } from './catalogTypes'

// Port dari Sukarame/app/lib/providers/cart_provider.dart — urutan insert
// (transactions -> transaction_items -> fnb_tables -> transaction_payments)
// dan nilai kolom (amount = total, BUKAN uang tunai diterima) dipertahankan
// persis, supaya trigger fn_guard_payment (cek v_paid = v_total) tidak
// menganggap ini overpayment.
interface CartStore {
  items: CartItem[]
  tableId: string | null
  loading: boolean
  error: string | null
  setTable: (id: string | null) => void
  add: (item: CatalogItem) => void
  remove: (itemId: string) => void
  clear: () => void
  checkout: (branchId: string, method: string) => Promise<string | null>
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  tableId: null,
  loading: false,
  error: null,

  setTable: (id) => set({ tableId: id }),

  add: (item) => {
    const items = get().items
    const idx = items.findIndex((c) => c.item.id === item.id)
    if (idx >= 0) {
      const next = [...items]
      next[idx] = { ...next[idx], qty: next[idx].qty + 1 }
      set({ items: next })
    } else {
      set({ items: [...items, { item, qty: 1 }] })
    }
  },

  remove: (itemId) => {
    const items = get().items
    const idx = items.findIndex((c) => c.item.id === itemId)
    if (idx < 0) return
    if (items[idx].qty > 1) {
      const next = [...items]
      next[idx] = { ...next[idx], qty: next[idx].qty - 1 }
      set({ items: next })
    } else {
      set({ items: items.filter((c) => c.item.id !== itemId) })
    }
  },

  clear: () => set({ items: [], tableId: null }),

  checkout: async (branchId, method) => {
    const { items, tableId } = get()
    if (items.length === 0) return null
    set({ loading: true, error: null })
    const total = cartTotal(items)
    try {
      const { data: txn, error: txnError } = await supabase
        .from('transactions')
        .insert({ branch_id: branchId, status: 'open', subtotal: total, total })
        .select('id')
        .single<{ id: string }>()
      if (txnError) throw txnError
      const txnId = txn.id

      const { error: itemsError } = await supabase.from('transaction_items').insert(
        items.map((c) => ({
          transaction_id: txnId,
          catalog_item_id: c.item.id,
          name_snapshot: c.item.name,
          qty: c.qty,
          price: c.item.price,
        })),
      )
      if (itemsError) throw itemsError

      if (tableId) {
        const { error: tableError } = await supabase
          .from('fnb_tables')
          .update({ status: 'occupied' })
          .eq('id', tableId)
        if (tableError) throw tableError
      }

      const { error: paymentError } = await supabase
        .from('transaction_payments')
        .insert({ transaction_id: txnId, method, amount: total })
      if (paymentError) throw paymentError

      get().clear()
      return txnId
    } catch (e) {
      set({ error: getErrorMessage(e) })
      return null
    } finally {
      set({ loading: false })
    }
  },
}))

export function cartCount(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.qty, 0)
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.item.price * i.qty, 0)
}
