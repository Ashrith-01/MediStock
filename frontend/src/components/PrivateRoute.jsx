import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wrap protected pages. Optionally restrict to specific roles:
// <PrivateRoute roles={['ADMIN']}><AdminOnlyPage /></PrivateRoute>
export default function PrivateRoute({ children, roles }) {
  const { isAuthenticated, hasRole } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
