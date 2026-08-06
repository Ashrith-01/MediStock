import React from 'react'
import Navbar from '../components/Navbar'
import DashboardSummaryCards from '../components/DashboardSummaryCards'
import RecentExpiryTable from '../components/RecentExpiryTable'

const StaffDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Staff Dashboard</h1>
          <p className="text-sm text-gray-500">Inventory metrics and stock expiry monitoring</p>
        </div>

        <DashboardSummaryCards />

        <div className="mt-8">
          <RecentExpiryTable />
        </div>
      </main>
    </div>
  )
}

export default StaffDashboard
