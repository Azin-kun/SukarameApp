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

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Sukarame Admin</div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `${styles.navLink}${isActive ? ` ${styles.navLinkActive}` : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
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
