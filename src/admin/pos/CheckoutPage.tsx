import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatRupiah } from '../../shared/format'
import { useAuthStore } from '../auth/authStore'
import { useCartStore, cartTotal } from './cartStore'
import type { CartItem } from './catalogTypes'
import ReceiptModal from './ReceiptModal'
import styles from './CheckoutPage.module.css'

const METHODS = ['cash', 'qris', 'transfer'] as const

interface ReceiptData {
  txnId: string
  items: CartItem[]
  total: number
  cashPaid?: number
  method: string
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const branchId = useAuthStore((s) => s.branchId)
  const cartItems = useCartStore((s) => s.items)
  const loading = useCartStore((s) => s.loading)
  const error = useCartStore((s) => s.error)
  const checkout = useCartStore((s) => s.checkout)

  const [method, setMethod] = useState<(typeof METHODS)[number]>('cash')
  const [cashInput, setCashInput] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)

  const total = cartTotal(cartItems)
  const cashAmount = Number(cashInput.replace(/\D/g, '')) || 0
  const change = cashAmount - total

  async function handlePay() {
    setValidationError(null)
    if (!branchId) return

    if (method === 'cash' && cashAmount < total) {
      setValidationError('Uang kurang')
      return
    }

    const itemsSnapshot = cartItems
    const totalSnapshot = total

    const txnId = await checkout(branchId, method)
    if (txnId) {
      setReceipt({
        txnId,
        items: itemsSnapshot,
        total: totalSnapshot,
        cashPaid: method === 'cash' ? cashAmount : undefined,
        method,
      })
    }
  }

  if (receipt) {
    return (
      <ReceiptModal
        txnId={receipt.txnId}
        items={receipt.items}
        total={receipt.total}
        cashPaid={receipt.cashPaid}
        method={receipt.method}
        onDone={() => navigate('/admin/pos')}
      />
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Pembayaran</h1>

      <h2 className={styles.sectionTitle}>Ringkasan Pesanan</h2>
      <div className={styles.summary}>
        {cartItems.map((ci) => (
          <div className={styles.summaryRow} key={ci.item.id}>
            <span>
              {ci.item.name} ×{ci.qty}
            </span>
            <span>{formatRupiah(ci.item.price * ci.qty)}</span>
          </div>
        ))}
      </div>

      <div className={styles.totalRow}>
        <span>Total</span>
        <strong>{formatRupiah(total)}</strong>
      </div>

      <h2 className={styles.sectionTitle}>Metode Pembayaran</h2>
      <div className={styles.methods}>
        {METHODS.map((m) => (
          <label className={styles.methodOption} key={m}>
            <input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} />
            {m.toUpperCase()}
          </label>
        ))}
      </div>

      {method === 'cash' && (
        <div className={styles.cashField}>
          <label htmlFor="cash-input">Uang Diterima</label>
          <input
            id="cash-input"
            type="text"
            inputMode="numeric"
            placeholder="Rp 0"
            value={cashInput}
            onChange={(e) => setCashInput(e.target.value)}
          />
          {cashAmount >= total && cashAmount > 0 && (
            <div className={styles.changeRow}>
              <span>Kembalian:</span>
              <strong>{formatRupiah(change)}</strong>
            </div>
          )}
        </div>
      )}

      {(validationError || error) && <p className={styles.error}>{validationError ?? error}</p>}

      <button className={styles.payBtn} disabled={loading} onClick={handlePay}>
        {loading ? 'Memproses...' : `Bayar ${formatRupiah(total)}`}
      </button>
    </div>
  )
}
