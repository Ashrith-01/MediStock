import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const AdminDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setData(response.data)
      } catch (err) {
        setError('Unable to load admin dashboard data')
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
      <h1>Admin Dashboard</h1>
      <div className="grid">
        <div className="card">Total Medicines: {data?.totalMedicines}</div>
        <div className="card">Total Suppliers: {data?.totalSuppliers}</div>
        <div className="card">Total Users: {data?.totalUsers}</div>
        <div className="card">Low Stock: {data?.lowStockCount}</div>
        <div className="card">Out of Stock: {data?.outOfStockCount}</div>
        <div className="card">Expired: {data?.expiredMedicinesCount}</div>
      </div>
      <h2>Recent Activities</h2>
      <ul>
        {data?.recentInventoryActivities?.map((item) => (
          <li key={item.id}>{item.actionType} - {item.newQuantity} units</li>
        ))}
      </ul>
    </div>
  )
}

export default AdminDashboard
