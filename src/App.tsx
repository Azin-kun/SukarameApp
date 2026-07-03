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
import PosPage from './admin/pos/PosPage'
import CheckoutPage from './admin/pos/CheckoutPage'
import TablesPage from './admin/tables/TablesPage'
import BookingPage from './admin/tables/BookingPage'
import TransactionsPage from './admin/transactions/TransactionsPage'
import ReportsPage from './admin/reports/ReportsPage'
import StockPage from './admin/stock/StockPage'
import StaffPage from './admin/staff/StaffPage'
import ShiftPage from './admin/shift/ShiftPage'
import SettingsPage from './admin/settings/SettingsPage'

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
            <Route path="pos" element={<PosPage />} />
            <Route path="pos/checkout" element={<CheckoutPage />} />
            <Route path="tables" element={<TablesPage />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="shift" element={<ShiftPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<p>Modul ini belum tersedia — menyusul di fase berikutnya.</p>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
