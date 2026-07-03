import { useEffect, useMemo, useState } from 'react'
import { getErrorMessage } from '../../shared/errors'
import { formatRupiah, formatDateTime } from '../../shared/format'
import { useAuthStore } from '../auth/authStore'
import { fetchTransactionsSince } from '../transactions/api'
import type { Transaction } from '../transactions/types'
import styles from './ReportsPage.module.css'

type Period = 'today' | 'week' | 'month'

const PERIOD_LABEL: Record<Period, string> = {
  today: 'Hari ini',
  week: '7 Hari',
  month: 'Bulan ini',
}

// Port dari reports_screen.dart — batas bawah periode saja, tanpa batas atas
// (selalu "dari X sampai sekarang"), persis termasuk inkonsistensi asalnya:
// today/month pakai tengah malam lokal, week pakai jendela 7x24 jam dari sekarang.
function periodStart(period: Period): Date {
  const now = new Date()
  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
}

export default function ReportsPage() {
  const branchId = useAuthStore((s) => s.branchId)
  const [period, setPeriod] = useState<Period>('today')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!branchId) return
    setLoading(true)
    setError(null)
    fetchTransactionsSince(branchId, periodStart(period).toISOString())
      .then(setTransactions)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [branchId, period])

  const totalRevenue = useMemo(() => transactions.reduce((s, t) => s + t.total, 0), [transactions])
  const totalCount = transactions.length

  const topItems = useMemo(() => {
    const stats = new Map<string, { qty: number; revenue: number }>()
    for (const t of transactions) {
      for (const i of t.items) {
        const cur = stats.get(i.nameSnapshot) ?? { qty: 0, revenue: 0 }
        cur.qty += i.qty
        cur.revenue += i.price * i.qty
        stats.set(i.nameSnapshot, cur)
      }
    }
    return Array.from(stats.entries())
      .map(([name, s]) => ({ name, ...s }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10)
  }, [transactions])

  const recent = transactions.slice(0, 20)

  return (
    <div>
      <h1 className={styles.title}>Laporan</h1>

      <div className={styles.periodRow}>
        {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
          <button
            key={p}
            className={`${styles.periodChip}${period === p ? ` ${styles.periodChipActive}` : ''}`}
            onClick={() => setPeriod(p)}
          >
            {PERIOD_LABEL[p]}
          </button>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p>Memuat laporan...</p>
      ) : (
        <>
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Transaksi</div>
              <div className={styles.summaryValue}>{totalCount}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Pendapatan</div>
              <div className={styles.summaryValue}>{formatRupiah(totalRevenue)}</div>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Item Terlaris</h2>
          {topItems.length === 0 ? (
            <p className={styles.empty}>Belum ada data.</p>
          ) : (
            <div className={styles.topItems}>
              {topItems.map((i) => (
                <div className={styles.topItemRow} key={i.name}>
                  <span>{i.name}</span>
                  <span className={styles.topItemQty}>×{i.qty}</span>
                  <strong>{formatRupiah(i.revenue)}</strong>
                </div>
              ))}
            </div>
          )}

          <h2 className={styles.sectionTitle}>Riwayat Transaksi</h2>
          {recent.length === 0 ? (
            <p className={styles.empty}>Belum ada transaksi.</p>
          ) : (
            <div className={styles.recentList}>
              {recent.map((t) => (
                <div className={styles.recentRow} key={t.id}>
                  <span>{formatDateTime(t.createdAt)}</span>
                  <strong>{formatRupiah(t.total)}</strong>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
