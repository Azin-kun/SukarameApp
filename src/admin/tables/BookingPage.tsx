import { useEffect, useState } from 'react'
import { supabase } from '../../shared/supabaseClient'
import { getErrorMessage } from '../../shared/errors'
import { formatDateTime } from '../../shared/format'
import { useAuthStore } from '../auth/authStore'
import { ACTIVE_BOOKING_STATUSES, BOOKING_STATUS_LABEL, type Booking, type BookingStatus } from './types'
import styles from './BookingPage.module.css'

const LISTED_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'in_progress', 'completed']

// Port dari booking_screen.dart: aksi berikutnya tergantung status saat ini.
function nextAction(status: BookingStatus): { label: string; next: BookingStatus } | null {
  if (status === 'pending') return { label: 'Konfirmasi', next: 'confirmed' }
  if (status === 'confirmed') return { label: 'Mulai', next: 'in_progress' }
  if (status === 'in_progress') return { label: 'Selesai', next: 'completed' }
  return null
}

export default function BookingPage() {
  const branchId = useAuthStore((s) => s.branchId)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [actionsFor, setActionsFor] = useState<Booking | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [resourceRef, setResourceRef] = useState('')
  const [startTime, setStartTime] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('bookings')
      .select('id, branch_id, resource_ref, start_time, end_time, status, created_at, customers(name, phone)')
      .eq('branch_id', branchId ?? '')
      .in('status', LISTED_STATUSES)
      .order('start_time')
    if (error) {
      setError(getErrorMessage(error))
    } else {
      setBookings(
        (data ?? []).map((r) => {
          const customer = Array.isArray(r.customers) ? r.customers[0] : r.customers
          return {
            id: r.id,
            branchId: r.branch_id,
            customerName: customer?.name ?? null,
            customerPhone: customer?.phone ?? null,
            resourceRef: r.resource_ref,
            startTime: r.start_time,
            endTime: r.end_time,
            status: r.status,
            createdAt: r.created_at,
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

  function openForm() {
    const defaultStart = new Date(Date.now() + 60 * 60 * 1000)
    setName('')
    setPhone('')
    setResourceRef('')
    setStartTime(toLocalInputValue(defaultStart))
    setFormOpen(true)
  }

  async function submitBooking() {
    if (!name.trim() || !startTime || !branchId) return
    setSubmitting(true)
    const start = new Date(startTime)
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000) // port: durasi selalu 2 jam (hardcode di booking_screen.dart)
    const { error } = await supabase.rpc('create_public_booking', {
      branch_id: branchId,
      customer_name: name.trim(),
      customer_phone: phone.trim() || null,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      resource_ref: resourceRef.trim() || null,
    })
    setSubmitting(false)
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    setFormOpen(false)
    load()
  }

  async function setStatus(booking: Booking, status: BookingStatus) {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', booking.id)
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    setActionsFor(null)
    load()
  }

  if (loading) return <p>Memuat reservasi...</p>

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Reservasi</h1>
        <button className={styles.newBtn} onClick={openForm}>
          + Reservasi Baru
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.list}>
        {bookings.length === 0 && <p className={styles.empty}>Belum ada reservasi.</p>}
        {bookings.map((b) => (
          <button className={styles.row} key={b.id} onClick={() => ACTIVE_BOOKING_STATUSES.includes(b.status) && setActionsFor(b)}>
            <div>
              <div className={styles.rowName}>{b.customerName ?? 'Tanpa nama'}</div>
              <div className={styles.rowMeta}>
                {formatDateTime(b.startTime)} {b.resourceRef ? `· ${b.resourceRef}` : ''}
              </div>
            </div>
            <span className={`${styles.statusBadge} ${styles[`status_${b.status}`]}`}>{BOOKING_STATUS_LABEL[b.status]}</span>
          </button>
        ))}
      </div>

      {formOpen && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setFormOpen(false)}>
          <div className={styles.sheet}>
            <h2 className={styles.sheetTitle}>Reservasi Baru</h2>
            <div className={styles.field}>
              <label>Nama Tamu *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama tamu" />
            </div>
            <div className={styles.field}>
              <label>No. HP</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xx" />
            </div>
            <div className={styles.field}>
              <label>Meja / Keterangan</label>
              <input value={resourceRef} onChange={(e) => setResourceRef(e.target.value)} placeholder="Misal: Meja 3, dekat jendela" />
            </div>
            <div className={styles.field}>
              <label>Waktu</label>
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <button className={styles.submitBtn} disabled={submitting || !name.trim() || !startTime} onClick={submitBooking}>
              {submitting ? 'Menyimpan...' : 'Simpan Reservasi'}
            </button>
            <button className={styles.cancelBtn} onClick={() => setFormOpen(false)}>
              Batal
            </button>
          </div>
        </div>
      )}

      {actionsFor && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setActionsFor(null)}>
          <div className={styles.sheet}>
            <h2 className={styles.sheetTitle}>{actionsFor.customerName ?? 'Tanpa nama'}</h2>
            <p className={styles.sheetSubtitle}>{BOOKING_STATUS_LABEL[actionsFor.status]}</p>
            {nextAction(actionsFor.status) && (
              <button className={styles.statusOption} onClick={() => setStatus(actionsFor, nextAction(actionsFor.status)!.next)}>
                {nextAction(actionsFor.status)!.label}
              </button>
            )}
            <button className={`${styles.statusOption} ${styles.cancelOption}`} onClick={() => setStatus(actionsFor, 'cancelled')}>
              Batalkan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
