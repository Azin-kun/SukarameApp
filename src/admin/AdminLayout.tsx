import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuthStore } from './auth/authStore'
import styles from './AdminLayout.module.css'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', end: true },
  { label: 'Kasir POS', to: '/admin/pos' },
  { label: 'Meja', to: '/admin/tables' },
  { label: 'Reservasi', to: '/admin/booking' },
  { label: 'Shift', to: '/admin/shift' },
  { label: 'Transaksi', to: '/admin/transactions' },
  { label: 'Laporan', to: '/admin/reports' },
  { label: 'Stok', to: '/admin/stock' },
  { label: 'Karyawan', to: '/admin/staff' },
  { label: 'Pengaturan', to: '/admin/settings' },
]

export default function AdminLayout() {
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={styles.shell}>
      {sidebarOpen && <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />}

      <aside className={`${styles.sidebar}${sidebarOpen ? ` ${styles.sidebarOpen}` : ''}`}>
        <div className={styles.brand}>Sukarame Admin</div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `${styles.navLink}${isActive ? ` ${styles.navLinkActive}` : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            aria-label="Buka menu"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            ☰
          </button>
          <span className={styles.greeting}>
            Halo, <strong>{profile?.displayName ?? 'Staff'}</strong>
          </span>
          <button className={styles.logoutBtn} onClick={() => signOut()}>
            Keluar
          </button>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
