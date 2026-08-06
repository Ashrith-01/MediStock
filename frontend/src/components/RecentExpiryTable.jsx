import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosInstance'

export default function RecentExpiryTable() {
  const { user } = useAuth()
  const role = user?.role?.toUpperCase()

  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  const isAllowed = ['ADMIN', 'PHARMACIST', 'STAFF'].includes(role)

  useEffect(() => {
    if (!isAllowed) return

    let isMounted = true
    const fetchExpiring = async () => {
      try {
        const { data } = await api.get('/medicines/expiring', { params: { days: 90 } })
        if (!isMounted) return

        const sorted = (data || []).sort(
          (a, b) => new Date(a.expiryDate || '9999-12-31') - new Date(b.expiryDate || '9999-12-31')
        )
        setMedicines(sorted)
      } catch (err) {
        if (isMounted) setError('Failed to load recent expiry records.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchExpiring()
    return () => {
      isMounted = false
    }
  }, [isAllowed])

  if (!isAllowed) {
    return null
  }

  const getDaysRemaining = (expiryDateStr) => {
    if (!expiryDateStr) return 999
    const expiry = new Date(expiryDateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = expiry - today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const filteredMedicines = medicines.filter((med) => {
    const days = getDaysRemaining(med.expiryDate)
    if (filter === 'EXPIRED') return days <= 0
    if (filter === 'CRITICAL') return days > 0 && days <= 15
    return true
  })

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-extrabold text-slate-100">Recent Expiry Tracking</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Medicines expiring soon or requiring priority stock rotation
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {[
            { id: 'ALL', label: 'All Impending' },
            { id: 'CRITICAL', label: '< 15 Days' },
            { id: 'EXPIRED', label: 'Expired' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === tab.id
                  ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl mb-4 border border-rose-500/20">{error}</div>}

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm animate-pulse">
          Loading expiry tracking data...
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-sm">
          <svg className="w-12 h-12 text-emerald-400/60 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold text-slate-300">No matching expiry records</p>
          <p className="text-xs text-slate-500 mt-1">All inventory items are currently within safe date thresholds.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                <th className="py-3 px-4 rounded-l-lg">Medicine Name</th>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Stock Qty</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Risk Status</th>
                <th className="py-3 px-4 text-center rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredMedicines.slice(0, 8).map((med) => {
                const days = getDaysRemaining(med.expiryDate)
                let statusBadge

                if (days <= 0) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      Expired ({Math.abs(days)}d ago)
                    </span>
                  )
                } else if (days <= 15) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Critical ({days}d left)
                    </span>
                  )
                } else {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                      Expiring ({days}d left)
                    </span>
                  )
                }

                return (
                  <tr key={med.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-100">{med.name}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{med.batchNumber || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs">{med.categoryName || 'General'}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-100">{med.quantity}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs font-medium">
                      {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">{statusBadge}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        to="/medicines"
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
