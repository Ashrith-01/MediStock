import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const PharmacistDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/api/pharmacist/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setData(response.data)
      } catch (err) {
        setError('Unable to load pharmacist dashboard')
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
      <h1>Pharmacist Dashboard</h1>
      <div className="grid">
        <div className="card">Total Medicines: {data?.totalMedicines}</div>
        <div className="card">Low Stock: {data?.lowStockCount}</div>
        <div className="card">Expired Medicines: {data?.expiredMedicinesCount}</div>
      </div>
      <h2>Low Stock Medicines</h2>
      <ul>
        {data?.lowStockMedicines?.map((item) => (
          <li key={item.id}>{item.medicineName} - Qty {item.quantity}</li>
        ))}
      </ul>
    </div>
  )
}

export default PharmacistDashboard
