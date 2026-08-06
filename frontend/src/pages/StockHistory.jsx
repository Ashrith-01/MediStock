import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axiosInstance'

export default function StockHistory() {
  const { medicineId } = useParams()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await api.get(`/stock-logs/${medicineId}`)
        setLogs(response.data || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load stock history.')
      } finally {
        setLoading(false)
      }
    }
    if (medicineId) {
      load()
    }
  }, [medicineId])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight sm:text-3xl">Medicine Stock History</h1>
            <p className="text-sm text-slate-400 mt-0.5">Tracking logs for Medicine ID #{medicineId}</p>
          </div>
          <Link to="/medicines" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
            ← Back to Medicines
          </Link>
        </div>

        {error && <div className="mb-6 p-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">{error}</div>}

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm animate-pulse">Loading stock history logs...</div>
        ) : logs.length === 0 ? (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
            No history activity recorded for this medicine yet.
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const change = log.quantityChange ?? ((log.newQuantity || 0) - (log.oldQuantity || 0))
              return (
                <div key={log.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-100">{log.actionType}</span>
                      <span className="text-xs text-slate-400 font-mono">({new Date(log.timestamp).toLocaleString()})</span>
                    </div>
                    <p className="text-xs text-slate-400">{log.performedBy ? `By: ${log.performedBy}` : 'System Log'}</p>
                    {log.note && <p className="text-xs text-slate-300 italic mt-2">"{log.note}"</p>}
                  </div>
                  <div className="text-right shrink-0 font-mono text-sm">
                    <span className="text-slate-400">{log.oldQuantity}</span>
                    <span className="mx-2 text-slate-600">→</span>
                    <span className="font-bold text-slate-100">{log.newQuantity}</span>
                    <span className="ml-2 font-bold text-xs text-cyan-400">({change > 0 ? `+${change}` : change})</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
