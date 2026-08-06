import React from 'react'
import Navbar from '../components/Navbar'
import DashboardSummaryCards from '../components/DashboardSummaryCards'
import CategoryPieChart from '../components/CategoryPieChart'
import MonthlyStockChart from '../components/MonthlyStockChart'
import RecentExpiryTable from '../components/RecentExpiryTable'

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Complete system metrics and inventory administration</p>
        </div>

        <DashboardSummaryCards />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryPieChart />
          <MonthlyStockChart />
        </div>

        <div className="mt-8">
          <RecentExpiryTable />
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
