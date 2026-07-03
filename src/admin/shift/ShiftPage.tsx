import { useEffect, useState } from 'react'
import { supabase } from '../../shared/supabaseClient'
import { getErrorMessage } from '../../shared/errors'
import { formatRupiah, formatDateTime } from '../../shared/format'
import { useAuthStore } from '../auth/authStore'
import type { StaffShift } from './types'
import styles from './ShiftPage.module.css'

function formatDuration(fromIso: string, toMs: number): string {
  const ms = toMs - new Date(fromIso).getTime()
  const totalMin = Math.max(0, Math.floor(ms / 60000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${h} jam ${m} menit`
}

export default function ShiftPage() {
  const branchId = useAuthStore((s) => s.branchId)
  const profile = useAuthStore((s) => s.profile)
  const [shift, setShift] = useState<StaffShift | null>(null)
  const [closedSummary, setClosedSummary] = useState<StaffShift | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())

  const [openDialogOpen, setOpenDialogOpen] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [cashInput, setCashInput] = useState('0')
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!branchId || !profile) return
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('staff_shifts')
      .select('id, branch_id, staff_profile_id, opening_cash, closing_cash, opened_at, closed_at')
      .eq('branch_id', branchId)
      .is('closed_at', null)
      .eq('staff_profile_id', profile.id)
      .order('opened_at', { ascending: false })
      .limit(1)
    if (error) {
      setError(getErrorMessage(error))
    } else {
      const row = data?.[0]
      setShift(
        row
          ? {
              id: row.id,
              branchId: row.branch_id,
              staffProfileId: row.staff_profile_id,
              openingCash: Number(row.opening_cash ?? 0),
              closingCash: row.closing_cash != null ? Number(row.closing_cash) : null,
              openedAt: row.opened_at,
              closedAt: row.closed_at,
            }
          : null,
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, profile?.id])

  useEffect(() => {
    if (!shift) return
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [shift])

  async function openShift() {
    if (!branchId || !profile) return
    setSaving(true)
    const cash = Number(cashInput) || 0
    const { data, error } = await supabase
      .from('staff_shifts')
      .insert({ branch_id: branchId, staff_profile_id: profile.id, opening_cash: cash })
      .select('id, branch_id, staff_profile_id, opening_cash, closing_cash, opened_at, closed_at')
      .single()
    setSaving(false)
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    setShift({
      id: data.id,
      branchId: data.branch_id,
      staffProfileId: data.staff_profile_id,
      openingCash: Number(data.opening_cash ?? 0),
      closingCash: null,
      openedAt: data.opened_at,
      closedAt: null,
    })
    setOpenDialogOpen(false)
    setCashInput('0')
  }

  async function closeShift() {
    if (!shift) return
    setSaving(true)
    const cash = Number(cashInput) || 0
    const closedAt = new Date().toISOString()
    const { error } = await supabase.from('staff_shifts').update({ closing_cash: cash, closed_at: closedAt }).eq('id', shift.id)
    setSaving(false)
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    const closed: StaffShift = { ...shift, closingCash: cash, closedAt }
    setCloseDialogOpen(false)
    setCashInput('0')
    setShift(null)
    setClosedSummary(closed)
  }

  if (loading) return <p>Memuat shift...</p>

  return (
    <div>
      <h1 className={styles.title}>Shift</h1>
      {error && <p className={styles.error}>{error}</p>}

      {!shift ? (
        <div className={styles.emptyCard}>
          <p>Belum ada shift aktif.</p>
          <button className={styles.openBtn} onClick={() => setOpenDialogOpen(true)}>
            Buka Shift
          </button>
        </div>
      ) : (
        <div className={styles.activeCard}>
          <div className={styles.activeBadge}>Shift Aktif</div>
          <div className={styles.activeRow}>
            <span>Dibuka</span>
            <strong>{formatDateTime(shift.openedAt)}</strong>
          </div>
          <div className={styles.activeRow}>
            <span>Durasi</span>
            <strong>{formatDuration(shift.openedAt, now)}</strong>
          </div>
          <div className={styles.activeRow}>
            <span>Uang Kas Awal</span>
            <strong>{formatRupiah(shift.openingCash)}</strong>
          </div>
          <button className={styles.closeBtn} onClick={() => setCloseDialogOpen(true)}>
            Tutup Shift
          </button>
        </div>
      )}

      {openDialogOpen && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setOpenDialogOpen(false)}>
          <div className={styles.sheet}>
            <h2 className={styles.sheetTitle}>Buka Shift</h2>
            <div className={styles.field}>
              <label htmlFor="opening-cash">Uang Kas Awal</label>
              <input id="opening-cash" type="number" value={cashInput} onChange={(e) => setCashInput(e.target.value)} />
            </div>
            <button className={styles.openBtn} disabled={saving} onClick={openShift}>
              {saving ? 'Menyimpan...' : 'Buka Shift'}
            </button>
            <button className={styles.cancelBtn} onClick={() => setOpenDialogOpen(false)}>
              Batal
            </button>
          </div>
        </div>
      )}

      {closeDialogOpen && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setCloseDialogOpen(false)}>
          <div className={styles.sheet}>
            <h2 className={styles.sheetTitle}>Tutup Shift</h2>
            <div className={styles.field}>
              <label htmlFor="closing-cash">Uang Kas Akhir</label>
              <input id="closing-cash" type="number" value={cashInput} onChange={(e) => setCashInput(e.target.value)} />
            </div>
            <button className={styles.closeBtn} disabled={saving} onClick={closeShift}>
              {saving ? 'Menyimpan...' : 'Tutup Shift'}
            </button>
            <button className={styles.cancelBtn} onClick={() => setCloseDialogOpen(false)}>
              Batal
            </button>
          </div>
        </div>
      )}

      {closedSummary && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setClosedSummary(null)}>
          <div className={styles.sheet}>
            <h2 className={styles.sheetTitle}>Ringkasan Shift</h2>
            <div className={styles.activeRow}>
              <span>Dibuka</span>
              <strong>{formatDateTime(closedSummary.openedAt)}</strong>
            </div>
            <div className={styles.activeRow}>
              <span>Ditutup</span>
              <strong>{formatDateTime(closedSummary.closedAt!)}</strong>
            </div>
            <div className={styles.activeRow}>
              <span>Durasi</span>
              <strong>{formatDuration(closedSummary.openedAt, new Date(closedSummary.closedAt!).getTime())}</strong>
            </div>
            <div className={styles.activeRow}>
              <span>Kas Awal</span>
              <strong>{formatRupiah(closedSummary.openingCash)}</strong>
            </div>
            <div className={styles.activeRow}>
              <span>Kas Akhir</span>
              <strong>{formatRupiah(closedSummary.closingCash ?? 0)}</strong>
            </div>
            <div className={styles.activeRow}>
              <span>Selisih</span>
              <strong className={(closedSummary.closingCash ?? 0) - closedSummary.openingCash >= 0 ? styles.diffPositive : styles.diffNegative}>
                {formatRupiah((closedSummary.closingCash ?? 0) - closedSummary.openingCash)}
              </strong>
            </div>
            <button className={styles.cancelBtn} onClick={() => setClosedSummary(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
