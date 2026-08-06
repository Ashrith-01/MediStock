import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isLinkActive = (path) => location.pathname === path

  const linkClass = (path) =>
    `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isLinkActive(path)
        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan'
        : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
    }`

  const isAuthorizedRole =
    user &&
    (hasRole
      ? hasRole('ADMIN', 'PHARMACIST', 'STAFF')
      : ['ADMIN', 'PHARMACIST', 'STAFF'].includes(user.role?.toUpperCase()))

  const isAdmin =
    user && (hasRole ? hasRole('ADMIN') : user.role?.toUpperCase() === 'ADMIN')

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
        {/* Brand & Nav Items */}
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-glow-cyan group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              MediStock
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/dashboard" className={linkClass('/dashboard')}>
              Dashboard
            </Link>
            <Link to="/medicines" className={linkClass('/medicines')}>
              Medicines
            </Link>
            <Link to="/categories" className={linkClass('/categories')}>
              Categories
            </Link>
            <Link to="/suppliers" className={linkClass('/suppliers')}>
              Suppliers
            </Link>
            {isAdmin && (
              <>
                <Link to="/audit-logs" className={linkClass('/audit-logs')}>
                  Audit Logs
                </Link>
                <Link to="/users" className={linkClass('/users')}>
                  Users
                </Link>
                <Link to="/reports" className={linkClass('/reports')}>
                  Reports
                </Link>
              </>
            )}
          </div>
        </div>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-4">
          {isAuthorizedRole && <NotificationBell />}

          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-200">{user.fullName}</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 tracking-wider">
                {user.role}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
