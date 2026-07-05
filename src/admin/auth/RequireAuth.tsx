import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './authStore'

// Port dari redirect logic di Sukarame/app/lib/core/router.dart.
export default function RequireAuth() {
  const phase = useAuthStore((s) => s.phase)

  if (phase === 'initial') {
    return <p style={{ padding: '2rem', color: 'var(--color-text)' }}>Memuat...</p>
  }
  if (phase === 'unauthenticated') {
    return <Navigate to="/admin/login" replace />
  }
  if (phase === 'needsPin') {
    return <Navigate to="/admin/pin" replace />
  }
  return <Outlet />
}
