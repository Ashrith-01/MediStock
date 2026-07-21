import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const MedicinesList = () => {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/api/medicines', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMedicines(response.data.content || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading) return <div className="page"><h1>Loading medicines...</h1></div>

  return (
    <div className="page">
      <h1>Medicines</h1>
      <ul>
        {medicines.map((medicine) => (
          <li key={medicine.id}>{medicine.medicineName} - {medicine.category} - Qty {medicine.quantity}</li>
        ))}
      </ul>
    </div>
  )
}

export default MedicinesList
