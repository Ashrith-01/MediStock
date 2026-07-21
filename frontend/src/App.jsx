import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import PharmacistDashboard from './pages/PharmacistDashboard'
import StaffDashboard from './pages/StaffDashboard'
import MedicinesList from './pages/MedicinesList'
import SuppliersList from './pages/SuppliersList'
import StockHistory from './pages/StockHistory'
import './index.css'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['PHARMACIST']} />}>
            <Route path="/pharmacist" element={<PharmacistDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
            <Route path="/staff" element={<StaffDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'STAFF']} />}>
            <Route path="/medicines" element={<MedicinesList />} />
            <Route path="/suppliers" element={<SuppliersList />} />
            <Route path="/stock-history" element={<StockHistory />} />
          </Route>
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
