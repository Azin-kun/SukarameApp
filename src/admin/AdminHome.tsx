import { useAuthStore } from './auth/authStore'

export default function AdminHome() {
  const profile = useAuthStore((s) => s.profile)

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-yellow)', marginBottom: '.4rem' }}>
        Halo, {profile?.displayName ?? 'Staff'}!
      </h1>
      <p style={{ color: 'var(--color-text-muted)' }}>Selamat datang di Business OS. Pilih modul dari menu di samping.</p>
    </div>
  )
}
