import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = 'px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700'
  
  const isAuthorizedRole = user && (
    hasRole ? hasRole('ADMIN', 'PHARMACIST', 'STAFF') : ['ADMIN', 'PHARMACIST', 'STAFF'].includes(user.role?.toUpperCase())
  )

  const isAdmin = user && (
    hasRole ? hasRole('ADMIN') : user.role?.toUpperCase() === 'ADMIN'
  )

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-xl font-bold text-brand-600">MediStock</Link>
          <div className="hidden sm:flex gap-1">
            <Link to="/dashboard" className={linkClass}>Dashboard</Link>
            <Link to="/medicines" className={linkClass}>Medicines</Link>
            <Link to="/suppliers" className={linkClass}>Suppliers</Link>
            {isAdmin && (
              <Link to="/reports" className={linkClass}>
                Reports
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isAuthorizedRole && <NotificationBell />}
          {user && (
            <span className="text-sm text-gray-600">
              {user.fullName} <span className="ml-1 text-xs uppercase bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">{user.role}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
