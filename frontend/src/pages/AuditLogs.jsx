import React, { useEffect, useState, useCallback } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axiosInstance'

const ACTION_BADGES = {
  ADD: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  UPDATE: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  SALE: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  PURCHASE: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  RETURN: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/stock-logs')
      setLogs(data || [])
    } catch (err) {
      setError('Failed to load audit logs. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  const filteredLogs = logs.filter((log) => {
    const searchLower = search.toLowerCase()
    const matchesSearch =
      (log.medicineName && log.medicineName.toLowerCase().includes(searchLower)) ||
      (log.performedBy && log.performedBy.toLowerCase().includes(searchLower)) ||
      (log.note && log.note.toLowerCase().includes(searchLower))

    const matchesAction = actionFilter === 'ALL' || log.actionType === actionFilter
    return matchesSearch && matchesAction
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Compliance & Stock Audit Trail
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight sm:text-3xl">
            Inventory Audit Logs
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Complete historical audit trail documenting who changed inventory quantities, when, and why.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <svg className="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by medicine, user, or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="text-xs font-semibold border border-slate-800 rounded-xl px-3 py-2 bg-slate-950 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Actions</option>
                <option value="ADD">Stock Added (ADD)</option>
                <option value="UPDATE">Update (UPDATE)</option>
                <option value="SALE">Outflow / Sale (SALE)</option>
                <option value="PURCHASE">Purchase (PURCHASE)</option>
                <option value="DELETE">Removal (DELETE)</option>
              </select>
            </div>
            <div className="text-xs font-semibold text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              Logs Count: <strong className="text-slate-100">{filteredLogs.length}</strong>
            </div>
          </div>
        </div>

        {error && <div className="mb-6 p-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">{error}</div>}

        {/* Audit Logs Table */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm animate-pulse">
              Loading inventory audit logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <svg className="w-12 h-12 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-bold text-slate-300">No audit log records found</p>
              <p className="text-xs text-slate-500 mt-1">Try broadening search query or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                    <th className="py-3.5 px-4 rounded-l-lg">Timestamp (When)</th>
                    <th className="py-3.5 px-4">Changed By (Who)</th>
                    <th className="py-3.5 px-4">Medicine Item</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4 text-right">Qty Change</th>
                    <th className="py-3.5 px-4 rounded-r-lg">Audit Note / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredLogs.map((log) => {
                    const change = log.quantityChange ?? ((log.newQuantity || 0) - (log.oldQuantity || 0))
                    const changeBadge =
                      change > 0 ? (
                        <span className="font-bold text-emerald-400">+{change}</span>
                      ) : change < 0 ? (
                        <span className="font-bold text-rose-400">{change}</span>
                      ) : (
                        <span className="font-medium text-slate-500">0</span>
                      )

                    const badgeStyle = ACTION_BADGES[log.actionType] || 'bg-slate-800 text-slate-300 border-slate-700'

                    return (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-400 whitespace-nowrap">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center justify-center shrink-0">
                              {log.performedBy ? log.performedBy.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="font-semibold text-slate-200 text-xs">
                              {log.performedBy || 'System Administrator'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-100">
                          {log.medicineName || `Medicine #${log.medicineId}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeStyle}`}>
                            {log.actionType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs">
                          <span className="text-slate-500">{log.oldQuantity}</span>
                          <span className="mx-1 text-slate-600">→</span>
                          <span className="font-bold text-slate-100">{log.newQuantity}</span>
                          <span className="ml-1 text-xs">({changeBadge})</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400 italic">
                          {log.note || 'No notes attached.'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
