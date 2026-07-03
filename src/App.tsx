import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './customer/HomePage'
import OrderPage from './customer/OrderPage'
import AdminLayout from './admin/AdminLayout'
import AdminHome from './admin/AdminHome'
import LoginPage from './admin/auth/LoginPage'
import PinPage from './admin/auth/PinPage'
import RequireAuth from './admin/auth/RequireAuth'
import { useAuthStore } from './admin/auth/authStore'

export default function App() {
  const init = useAuthStore((s) => s.init)
  useEffect(() => {
    init()
  }, [init])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/order" element={<OrderPage />} />

        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/pin" element={<PinPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="*" element={<p>Modul ini belum tersedia — menyusul di fase berikutnya.</p>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
