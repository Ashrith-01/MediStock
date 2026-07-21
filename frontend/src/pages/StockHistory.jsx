import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const StockHistory = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/api/stock-logs/1', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setLogs(response.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading) return <div className="page"><h1>Loading stock history...</h1></div>

  return (
    <div className="page">
      <h1>Stock History</h1>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>{log.actionType} - {log.oldQuantity} → {log.newQuantity}</li>
        ))}
      </ul>
    </div>
  )
}

export default StockHistory
