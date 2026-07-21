import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/api/suppliers', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSuppliers(response.data.content || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading) return <div className="page"><h1>Loading suppliers...</h1></div>

  return (
    <div className="page">
      <h1>Suppliers</h1>
      <ul>
        {suppliers.map((supplier) => (
          <li key={supplier.id}>{supplier.supplierName} - {supplier.email}</li>
        ))}
      </ul>
    </div>
  )
}

export default SuppliersList
