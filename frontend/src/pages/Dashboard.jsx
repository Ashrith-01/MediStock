import React from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import DashboardSummaryCards from '../components/DashboardSummaryCards'
import CategoryPieChart from '../components/CategoryPieChart'
import MonthlyStockChart from '../components/MonthlyStockChart'
import RecentExpiryTable from '../components/RecentExpiryTable'

export default function Dashboard() {
  const { user } = useAuth()
  const role = user?.role?.toUpperCase()

  const getRoleTitle = (r) => {
    if (r === 'ADMIN') return 'Administrator'
    if (r === 'PHARMACIST') return 'Pharmacist'
    if (r === 'STAFF') return 'Staff Member'
    return r || 'User'
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Ambient background glow accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* User Greeting & Portal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight sm:text-3xl">
                Welcome back, {user?.fullName || 'User'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 tracking-wide uppercase">
                {getRoleTitle(role)}
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Real-time medical inventory metrics, category breakdown, stock movement, and expiry alerts.
            </p>
          </div>
        </div>

        {/* 1. Dashboard Summary Cards */}
        <DashboardSummaryCards />

        {/* 2 & 3. Charts Section */}
        {(role === 'ADMIN' || role === 'PHARMACIST') && (
          <div
            className={`mt-8 grid grid-cols-1 ${
              role === 'ADMIN' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'
            } gap-6`}
          >
            <CategoryPieChart />
            <MonthlyStockChart />
          </div>
        )}

        {/* 4. Recent Expiry Table */}
        <div className="mt-8">
          <RecentExpiryTable />
        </div>
      </main>
    </div>
  )
}
