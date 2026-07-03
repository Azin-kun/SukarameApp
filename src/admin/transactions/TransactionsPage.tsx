import { useEffect, useState } from 'react'
import { getErrorMessage } from '../../shared/errors'
import { formatRupiah, formatDateTime } from '../../shared/format'
import { useAuthStore } from '../auth/authStore'
import { fetchRecentTransactions } from './api'
import type { Transaction } from './types'
import styles from './TransactionsPage.module.css'

export default function TransactionsPage() {
  const branchId = useAuthStore((s) => s.branchId)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<Transaction | null>(null)

  async function load() {
    if (!branchId) return
    setLoading(true)
    setError(null)
    try {
      setTransactions(await fetchRecentTransactions(branchId))
    } catch (e) {
      setError(getErrorMessage(e))
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId])

  if (loading) return <p>Memuat transaksi...</p>

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Transaksi</h1>
        <button className={styles.refreshBtn} onClick={load}>
          ↻ Muat ulang
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {transactions.length === 0 && <p className={styles.empty}>Belum ada transaksi.</p>}

      <div className={styles.list}>
        {transactions.map((t) => (
          <button className={styles.row} key={t.id} onClick={() => setDetail(t)}>
            <div className={styles.rowLeft}>
              {/* status 'completed' = lunas (bukan 'settled' — nilai itu tidak pernah ada di DB, lihat log.md) */}
              <span className={`${styles.dot}${t.status === 'completed' ? ` ${styles.dotPaid}` : ''}`} />
              <div>
                <div className={styles.rowDate}>{formatDateTime(t.createdAt)}</div>
                <div className={styles.rowStatus}>{t.status.toUpperCase()}</div>
              </div>
            </div>
            <strong>{formatRupiah(t.total)}</strong>
          </button>
        ))}
      </div>

      {detail && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className={styles.sheet}>
            <h2 className={styles.sheetTitle}>{formatDateTime(detail.createdAt)}</h2>
            <p className={styles.sheetSubtitle}>{detail.status.toUpperCase()}</p>
            <div className={styles.items}>
              {detail.items.map((i) => (
                <div className={styles.itemRow} key={i.id}>
                  <span>
                    {i.nameSnapshot} ×{i.qty}
                  </span>
                  <span>{formatRupiah(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className={styles.totalRow}>
              <span>Total</span>
              <strong>{formatRupiah(detail.total)}</strong>
            </div>
            <button className={styles.closeBtn} onClick={() => setDetail(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
