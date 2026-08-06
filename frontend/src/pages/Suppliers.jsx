import React, { useEffect, useState, useCallback } from 'react'
import Navbar from '../components/Navbar'
import SupplierForm from '../components/SupplierForm'
import api from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'

export default function Suppliers() {
  const { hasRole } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)

  const canManage = hasRole('ADMIN', 'PHARMACIST')
  const canDelete = hasRole('ADMIN')

  const loadSuppliers = useCallback(async (name) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/suppliers', { params: name ? { name } : {} })
      setSuppliers(data)
    } catch (err) {
      setError('Failed to load suppliers.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSuppliers() }, [loadSuppliers])

  const handleSearch = (e) => {
    e.preventDefault()
    loadSuppliers(searchTerm)
  }

  const openCreate = () => { setEditingSupplier(null); setShowForm(true) }
  const openEdit = (supplier) => { setEditingSupplier(supplier); setShowForm(true) }

  const handleSubmit = async (form) => {
    if (editingSupplier) {
      await api.put(`/suppliers/${editingSupplier.id}`, form)
    } else {
      await api.post('/suppliers', form)
    }
    setShowForm(false)
    loadSuppliers(searchTerm)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier? This cannot be undone.')) return
    try {
      await api.delete(`/suppliers/${id}`)
      loadSuppliers(searchTerm)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete supplier.')
    }
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
          {canManage && (
            <button onClick={openCreate} className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-700">
              + Add Supplier
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search suppliers by name..."
            className="flex-1 max-w-sm border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button type="submit" className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
            Search
          </button>
        </form>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

        {showForm && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border p-6 max-w-lg">
            <h2 className="font-semibold text-gray-800 mb-4">{editingSupplier ? 'Edit Supplier' : 'New Supplier'}</h2>
            <SupplierForm
              initialData={editingSupplier}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              submitLabel={editingSupplier ? 'Update Supplier' : 'Create Supplier'}
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <p className="p-6 text-gray-500">Loading suppliers...</p>
          ) : suppliers.length === 0 ? (
            <p className="p-6 text-gray-500">No suppliers found.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Address</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500"># Medicines</th>
                  {canManage && <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.contactNumber || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.address || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.suppliedMedicineCount}</td>
                    {canManage && (
                      <td className="px-4 py-3 text-right space-x-3">
                        <button onClick={() => openEdit(s)} className="text-brand-600 hover:text-brand-700 font-medium">Edit</button>
                        {canDelete && (
                          <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-700 font-medium">Delete</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
