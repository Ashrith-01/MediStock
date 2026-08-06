import React from 'react'
import Navbar from '../components/Navbar'
import DashboardSummaryCards from '../components/DashboardSummaryCards'
import CategoryPieChart from '../components/CategoryPieChart'
import RecentExpiryTable from '../components/RecentExpiryTable'

const PharmacistDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Pharmacist Dashboard</h1>
          <p className="text-sm text-gray-500">Pharmacy stock monitoring and category insights</p>
        </div>

        <DashboardSummaryCards />

        <div className="mt-8 grid grid-cols-1 gap-6">
          <CategoryPieChart />
        </div>

        <div className="mt-8">
          <RecentExpiryTable />
        </div>
      </main>
    </div>
  )
}

export default PharmacistDashboard
