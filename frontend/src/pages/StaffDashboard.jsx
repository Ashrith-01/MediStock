import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const StaffDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/api/staff/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setData(response.data)
      } catch (err) {
        setError('Unable to load staff dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading) return <div className="page"><h1>Loading dashboard...</h1></div>
  if (error) return <div className="page"><p>{error}</p></div>

  return (
    <div className="page">
      <h1>Staff Dashboard</h1>
      <div className="grid">
        <div className="card">Available Medicines: {data?.availableMedicines?.length || 0}</div>
        <div className="card">Low Stock Count: {data?.lowStockCount}</div>
      </div>
      <h2>Recent Updates</h2>
      <ul>
        {data?.recentInventoryChanges?.map((item) => (
          <li key={item.id}>{item.actionType} - {item.newQuantity} units</li>
        ))}
      </ul>
    </div>
  )
}

export default StaffDashboard
