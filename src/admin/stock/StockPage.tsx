import { useEffect, useState } from 'react'
import { supabase } from '../../shared/supabaseClient'
import { getErrorMessage } from '../../shared/errors'
import { useAuthStore } from '../auth/authStore'
import type { InventoryItem } from './types'
import styles from './StockPage.module.css'

export default function StockPage() {
  const branchId = useAuthStore((s) => s.branchId)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<InventoryItem | null>(null)
  const [qtyInput, setQtyInput] = useState('')

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, catalog_item_id, branch_id, stock_qty, low_stock_threshold, unit, catalog_items(name)')
      .eq('branch_id', branchId ?? '')
      .order('stock_qty')
    if (error) {
      setError(getErrorMessage(error))
    } else {
      setItems(
        (data ?? []).map((r) => {
          const catalog = Array.isArray(r.catalog_items) ? r.catalog_items[0] : r.catalog_items
          return {
            id: r.id,
            catalogItemId: r.catalog_item_id,
            branchId: r.branch_id,
            itemName: catalog?.name ?? '',
            stockQty: Number(r.stock_qty),
            lowStockThreshold: Number(r.low_stock_threshold),
            unit: r.unit,
          }
        }),
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId])

  function openEdit(item: InventoryItem) {
    setEditing(item)
    setQtyInput(String(item.stockQty))
  }

  async function saveQty() {
    if (!editing) return
    const qty = Number(qtyInput)
    if (Number.isNaN(qty)) return
    const { error } = await supabase.from('inventory_items').update({ stock_qty: qty }).eq('id', editing.id)
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    setItems((prev) => prev.map((i) => (i.id === editing.id ? { ...i, stockQty: qty } : i)))
    setEditing(null)
  }

  if (loading) return <p>Memuat stok...</p>

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Stok</h1>
        <button className={styles.refreshBtn} onClick={load}>
          ↻ Muat ulang
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {items.length === 0 && <p className={styles.empty}>Belum ada data inventori.</p>}

      <div className={styles.list}>
        {items.map((item) => {
          const isLow = item.stockQty <= item.lowStockThreshold
          return (
            <button className={styles.row} key={item.id} onClick={() => openEdit(item)}>
              <div>
                <div className={styles.rowName}>{item.itemName}</div>
                <div className={styles.rowMin}>
                  Min: {item.lowStockThreshold} {item.unit ?? 'unit'}
                </div>
              </div>
              <div className={`${styles.qty}${isLow ? ` ${styles.qtyLow}` : ''}`}>
                {isLow && '⚠ '}
                {item.stockQty} {item.unit ?? 'unit'}
              </div>
            </button>
          )
        })}
      </div>

      {editing && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className={styles.sheet}>
            <h2 className={styles.sheetTitle}>{editing.itemName}</h2>
            <div className={styles.field}>
              <label htmlFor="stock-qty">Stok Saat Ini</label>
              <input id="stock-qty" type="number" value={qtyInput} onChange={(e) => setQtyInput(e.target.value)} />
            </div>
            <button className={styles.saveBtn} onClick={saveQty}>
              Simpan
            </button>
            <button className={styles.cancelBtn} onClick={() => setEditing(null)}>
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
