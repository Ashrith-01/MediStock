import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axiosInstance'

const StockHistory = () => {
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
        setLogs(response.data)
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

  if (loading) return <div className="page"><h1>Loading stock history...</h1></div>

  return (
    <div className="page">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock History</h1>
          <p className="text-sm text-gray-500">Medicine ID: {medicineId}</p>
        </div>
        <Link to="/medicines" className="text-brand-600 hover:underline">Back to medicines</Link>
      </div>

      {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

      {logs.length === 0 ? (
        <p className="text-gray-600">No activity recorded for this medicine.</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="font-semibold text-gray-800">{log.actionType.replace('_', ' ')}</p>
              <p className="text-sm text-gray-600">{log.oldQuantity} → {log.newQuantity}</p>
              <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
              {log.note && <p className="text-sm text-gray-700 mt-1">Note: {log.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StockHistory
