import { useEffect, useState } from 'react'
import { supabase } from '../../shared/supabaseClient'
import { getErrorMessage } from '../../shared/errors'
import { useAuthStore } from '../auth/authStore'
import { TABLE_STATUS_LABEL, type FnbTable, type TableStatus } from './types'
import styles from './TablesPage.module.css'

const ALL_STATUSES: TableStatus[] = ['available', 'occupied', 'reserved']

export default function TablesPage() {
  const branchId = useAuthStore((s) => s.branchId)
  const [tables, setTables] = useState<FnbTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTable, setActiveTable] = useState<FnbTable | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('fnb_tables')
      .select('id, branch_id, name, capacity, status')
      .eq('branch_id', branchId ?? '')
    if (error) {
      setError(getErrorMessage(error))
    } else {
      setTables(
        (data ?? []).map((r) => ({
          id: r.id,
          branchId: r.branch_id,
          name: r.name,
          capacity: r.capacity ?? 4,
          status: r.status ?? 'available',
        })),
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId])

  async function setStatus(table: FnbTable, status: TableStatus) {
    const { error } = await supabase.from('fnb_tables').update({ status }).eq('id', table.id)
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, status } : t)))
    setActiveTable(null)
  }

  if (loading) return <p>Memuat meja...</p>

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Meja</h1>
        <button className={styles.refreshBtn} onClick={load}>
          ↻ Muat ulang
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.grid}>
        {tables.map((t) => (
          <button className={styles.card} key={t.id} onClick={() => setActiveTable(t)}>
            <div className={styles.cardName}>{t.name}</div>
            <div className={styles.cardCapacity}>{t.capacity} kursi</div>
            <span className={`${styles.badge} ${styles[`badge_${t.status}`]}`}>{TABLE_STATUS_LABEL[t.status]}</span>
          </button>
        ))}
      </div>

      {activeTable && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setActiveTable(null)}>
          <div className={styles.sheet}>
            <h2 className={styles.sheetTitle}>{activeTable.name}</h2>
            <p className={styles.sheetSubtitle}>Ubah status meja</p>
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                className={`${styles.statusOption}${activeTable.status === s ? ` ${styles.statusOptionActive}` : ''}`}
                onClick={() => setStatus(activeTable, s)}
              >
                {TABLE_STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
