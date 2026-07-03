import { useState } from 'react'
import { useAuthStore } from '../auth/authStore'
import { getErrorMessage } from '../../shared/errors'
import WebsiteCmsPage from './WebsiteCmsPage'
import styles from './SettingsPage.module.css'

type Tab = 'akun' | 'website'

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('akun')
  const profile = useAuthStore((s) => s.profile)
  const changePin = useAuthStore((s) => s.changePin)
  const signOut = useAuthStore((s) => s.signOut)

  const [pinDialogOpen, setPinDialogOpen] = useState(false)
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function submitChangePin() {
    if (oldPin.length !== 6 || newPin.length !== 6) return
    setSaving(true)
    setPinError(null)
    try {
      const ok = await changePin(oldPin, newPin)
      if (!ok) {
        setPinError('PIN lama salah')
      } else {
        setPinDialogOpen(false)
        setOldPin('')
        setNewPin('')
      }
    } catch (e) {
      setPinError(getErrorMessage(e))
    }
    setSaving(false)
  }

  return (
    <div>
      <h1 className={styles.title}>Pengaturan</h1>

      <div className={styles.tabs}>
        <button className={`${styles.tab}${tab === 'akun' ? ` ${styles.tabActive}` : ''}`} onClick={() => setTab('akun')}>
          Akun
        </button>
        <button className={`${styles.tab}${tab === 'website' ? ` ${styles.tabActive}` : ''}`} onClick={() => setTab('website')}>
          Website
        </button>
      </div>

      {tab === 'akun' ? (
        <div className={styles.akunTab}>
          <div className={styles.profileCard}>
            <div className={styles.profileName}>{profile?.displayName ?? 'Staff'}</div>
            {profile?.phone && <div className={styles.profilePhone}>{profile.phone}</div>}
          </div>

          <button className={styles.actionRow} onClick={() => setPinDialogOpen(true)}>
            Ganti PIN
          </button>
          <button className={`${styles.actionRow} ${styles.logoutRow}`} onClick={() => signOut()}>
            Keluar
          </button>

          <p className={styles.footerNote}>Mie Ayam Sukarame Business OS v1.0</p>
        </div>
      ) : (
        <WebsiteCmsPage />
      )}

      {pinDialogOpen && (
        <div
          className={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && setPinDialogOpen(false)}
        >
          <div className={styles.sheet}>
            <h2 className={styles.sheetTitle}>Ganti PIN</h2>
            <div className={styles.field}>
              <label htmlFor="old-pin">PIN Lama</label>
              <input
                id="old-pin"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="new-pin-2">PIN Baru</label>
              <input
                id="new-pin-2"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            {pinError && <p className={styles.error}>{pinError}</p>}
            <button className={styles.saveBtn} disabled={saving || oldPin.length !== 6 || newPin.length !== 6} onClick={submitChangePin}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => {
                setPinDialogOpen(false)
                setPinError(null)
                setOldPin('')
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
