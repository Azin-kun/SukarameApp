import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './customer/HomePage'
import OrderPage from './customer/OrderPage'
import AdminLayout from './admin/AdminLayout'
import AdminHome from './admin/AdminHome'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
