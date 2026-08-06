import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Medicines from './pages/Medicines'
import Categories from './pages/Categories'
import Suppliers from './pages/Suppliers'
import StockHistory from './pages/StockHistory'
import AuditLogs from './pages/AuditLogs'
import Users from './pages/Users'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/medicines" element={<PrivateRoute><Medicines /></PrivateRoute>} />
          <Route path="/medicines/:medicineId/history" element={<PrivateRoute><StockHistory /></PrivateRoute>} />
          <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
          <Route path="/suppliers" element={<PrivateRoute><Suppliers /></PrivateRoute>} />
          <Route path="/audit-logs" element={<PrivateRoute roles={['ADMIN']}><AuditLogs /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute roles={['ADMIN']}><Users /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute roles={['ADMIN']}><Reports /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
