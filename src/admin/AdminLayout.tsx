import { Outlet } from 'react-router-dom'

// Shell admin. Belum ada auth guard & nav lengkap — ditambah di Fase 3.
export default function AdminLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <header style={{ padding: '1rem', borderBottom: '1px solid var(--color-line)' }}>
        <strong style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-yellow)' }}>
          Sukarame Admin
        </strong>
      </header>
      <main style={{ padding: '1.5rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
