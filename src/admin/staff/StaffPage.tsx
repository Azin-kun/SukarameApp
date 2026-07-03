import { useEffect, useState } from 'react'
import { supabase } from '../../shared/supabaseClient'
import { getErrorMessage } from '../../shared/errors'
import { useAuthStore } from '../auth/authStore'
import type { StaffProfile } from '../auth/authStore'
import styles from './StaffPage.module.css'

export default function StaffPage() {
  const myProfile = useAuthStore((s) => s.profile)
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<StaffProfile | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('id, user_id, display_name, phone, staff_roles(branch_id)')
    if (error) {
      setError(getErrorMessage(error))
    } else {
      setStaff(
        (data ?? []).map((r) => ({
          id: r.id,
          userId: r.user_id,
          displayName: r.display_name,
          phone: r.phone,
          branchId: r.staff_roles?.[0]?.branch_id ?? null,
        })),
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function resetPin() {
    if (!detail || newPin.length !== 6) return
    setSaving(true)
    const { error } = await supabase.rpc('set_pin', { p_staff_id: detail.id, p_pin: newPin })
    setSaving(false)
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    setResetOpen(false)
    setDetail(null)
    setNewPin('')
  }

  if (loading) return <p>Memuat staff...</p>

  return (
    <div>
      <h1 className={styles.title}>Karyawan</h1>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.list}>
        {staff.map((s) => (
          <button className={styles.row} key={s.id} onClick={() => setDetail(s)}>
            <div className={`${styles.avatar}${s.id === myProfile?.id ? ` ${styles.avatarMe}` : ''}`}>
              {s.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={styles.rowName}>
                {s.displayName}
                {s.id === myProfile?.id && ' (Anda)'}
              </div>
              {s.phone && <div className={styles.rowPhone}>{s.phone}</div>}
            </div>
          </button>
        ))}
      </div>

      {detail && !resetOpen && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className={styles.sheet}>
            <h2 className={styles.sheetTitle}>{detail.displayName}</h2>
            {detail.phone && <p className={styles.sheetSubtitle}>{detail.phone}</p>}
            <button className={styles.actionBtn} onClick={() => setResetOpen(true)}>
              Reset PIN
            </button>
            <button className={styles.cancelBtn} onClick={() => setDetail(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {detail && resetOpen && (
        <div
          className={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && (setResetOpen(false), setNewPin(''))}
        >
          <div className={styles.sheet}>
            <h2 className={styles.sheetTitle}>Reset PIN — {detail.displayName}</h2>
            <div className={styles.field}>
              <label htmlFor="new-pin">PIN Baru (6 digit)</label>
              <input
                id="new-pin"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <button className={styles.actionBtn} disabled={newPin.length !== 6 || saving} onClick={resetPin}>
              {saving ? 'Menyimpan...' : 'Simpan PIN Baru'}
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => {
                setResetOpen(false)
                setNewPin('')
              }}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
