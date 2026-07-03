import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from './authStore'
import styles from './PinPage.module.css'

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

export default function PinPage() {
  const phase = useAuthStore((s) => s.phase)
  const error = useAuthStore((s) => s.error)
  const verifyPin = useAuthStore((s) => s.verifyPin)
  const signOut = useAuthStore((s) => s.signOut)

  const [pin, setPin] = useState('')
  const [verifying, setVerifying] = useState(false)

  if (phase === 'unauthenticated') return <Navigate to="/admin/login" replace />
  if (phase === 'authenticated') return <Navigate to="/admin" replace />

  async function submit(nextPin: string) {
    setVerifying(true)
    const ok = await verifyPin(nextPin)
    if (!ok) {
      setPin('')
      setVerifying(false)
    }
  }

  function tap(digit: string) {
    if (verifying || pin.length >= 6) return
    const next = pin + digit
    setPin(next)
    if (next.length === 6) submit(next)
  }

  function del() {
    if (verifying || pin.length === 0) return
    setPin(pin.slice(0, -1))
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span>Masukkan PIN</span>
        <button className={styles.logoutBtn} onClick={() => signOut()}>
          Keluar
        </button>
      </header>

      <div className={styles.body}>
        <p className={styles.label}>PIN</p>
        <div className={styles.dots}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className={`${styles.dot}${i < pin.length ? ` ${styles.dotFilled}` : ''}`} />
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {verifying ? (
          <p className={styles.verifying}>Memverifikasi...</p>
        ) : (
          <div className={styles.numpad}>
            {NUMPAD_KEYS.map((k, i) =>
              k === '' ? (
                <span key={i} />
              ) : (
                <button key={i} className={styles.key} onClick={() => (k === '⌫' ? del() : tap(k))}>
                  {k}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  )
}
