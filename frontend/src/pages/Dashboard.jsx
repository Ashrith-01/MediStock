import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0, expiring: 0, suppliers: 0 })
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState('')
  const [historyError, setHistoryError] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [allRes, lowRes, outRes, expiringRes, suppliersRes] = await Promise.all([
          api.get('/medicines'),
          api.get('/medicines/low-stock'),
          api.get('/medicines/out-of-stock'),
          api.get('/medicines/expiring', { params: { days: 30 } }),
          api.get('/suppliers'),
        ])
        setStats({
          total: allRes.data.length,
          lowStock: lowRes.data.length,
          outOfStock: outRes.data.length,
          expiring: expiringRes.data.length,
          suppliers: suppliersRes.data.length,
        })
      } catch (err) {
        setError('Could not load dashboard data. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }

    const loadRecentStockLogs = async () => {
      try {
        const { data } = await api.get('/stock-logs/recent', { params: { limit: 5 } })
        setRecentLogs(data)
      } catch (err) {
        setHistoryError('Could not load recent stock activity.')
      } finally {
        setHistoryLoading(false)
      }
    }

    loadStats()
    loadRecentStockLogs()
  }, [])

  const cards = [
    { label: 'Total Medicines', value: stats.total, color: 'bg-brand-50 text-brand-700', link: '/medicines' },
    { label: 'Low Stock', value: stats.lowStock, color: 'bg-yellow-50 text-yellow-700', link: '/medicines?stockStatus=LOW_STOCK' },
    { label: 'Out of Stock', value: stats.outOfStock, color: 'bg-red-50 text-red-700', link: '/medicines?stockStatus=OUT_OF_STOCK' },
    { label: 'Expiring in 30 Days', value: stats.expiring, color: 'bg-orange-50 text-orange-700', link: '/medicines' },
    { label: 'Suppliers', value: stats.suppliers, color: 'bg-green-50 text-green-700', link: '/suppliers' },
  ]

  return (
    <div>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome back, {user?.fullName}</h1>
        <p className="text-gray-500 mb-6">Here's an overview of your medicine inventory.</p>

        {error && <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

        {loading ? (
          <p className="text-gray-500">Loading dashboard...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {cards.map((c) => (
              <Link key={c.label} to={c.link} className={`rounded-xl p-5 shadow-sm ${c.color} hover:shadow-md transition-shadow`}>
                <p className="text-3xl font-bold">{c.value}</p>
                <p className="text-sm font-medium mt-1">{c.label}</p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Link to="/medicines" className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-700">
            Manage Medicines
          </Link>
          <Link to="/suppliers" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
            Manage Suppliers
          </Link>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Recent Stock Activity</h2>
              <p className="text-sm text-gray-500">Latest inventory changes across your medicines.</p>
            </div>
            <Link to="/medicines" className="text-sm text-brand-600 hover:underline">View all medicines</Link>
          </div>

          {historyError && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{historyError}</div>}

          {historyLoading ? (
            <p className="text-gray-500">Loading recent stock activity...</p>
          ) : recentLogs.length === 0 ? (
            <p className="text-gray-600">No recent stock activity available.</p>
          ) : (
            <div className="grid gap-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{log.medicineName || `Medicine ${log.medicineId}`}</p>
                      <p className="text-xs text-gray-500">{log.actionType?.replace('_', ' ')}</p>
                    </div>
                    <Link to={`/medicines/${log.medicineId}/history`} className="text-sm text-brand-600 hover:underline">View history</Link>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="text-sm text-gray-600"><span className="font-semibold text-gray-900">Old</span> {log.oldQuantity}</div>
                    <div className="text-sm text-gray-600"><span className="font-semibold text-gray-900">New</span> {log.newQuantity}</div>
                    <div className="text-sm text-gray-600"><span className="font-semibold text-gray-900">When</span> {new Date(log.timestamp).toLocaleString()}</div>
                  </div>
                  {log.note && <p className="mt-3 text-sm text-gray-700">Note: {log.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
