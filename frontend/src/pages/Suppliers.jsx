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
      setSuppliers(data || [])
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight sm:text-3xl">Supplier Management</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage pharmaceutical vendors, contacts, and fulfillment partners</p>
          </div>
          {canManage && (
            <button onClick={openCreate} className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-glow-cyan transition-all">
              + Add Supplier
            </button>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-3 max-w-md">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search suppliers by name..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
          <button type="submit" className="bg-slate-800 border border-slate-700 text-slate-200 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            Search
          </button>
        </form>

        {error && <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</div>}

        {/* Supplier Form Drawer */}
        {showForm && (
          <div className="mb-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl max-w-lg">
            <h2 className="font-extrabold text-slate-100 text-base mb-4">{editingSupplier ? 'Edit Supplier' : 'New Supplier Registration'}</h2>
            <SupplierForm
              initialData={editingSupplier}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              submitLabel={editingSupplier ? 'Update Supplier' : 'Create Supplier'}
            />
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-lg overflow-x-auto">
          {loading ? (
            <p className="p-8 text-center text-slate-500 text-sm animate-pulse">Loading suppliers directory...</p>
          ) : suppliers.length === 0 ? (
            <p className="p-8 text-center text-slate-500 text-sm">No suppliers found.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                  <th className="py-3.5 px-4 rounded-l-lg">Supplier Name</th>
                  <th className="py-3.5 px-4">Contact Number</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4 text-center">Medicines Supplied</th>
                  {canManage && <th className="py-3.5 px-4 text-right rounded-r-lg">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-100">{s.name}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">{s.contactNumber || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs">{s.email || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">{s.address || '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {s.suppliedMedicineCount} items
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3.5 px-4 text-right space-x-3 text-xs font-semibold">
                        <button onClick={() => openEdit(s)} className="text-cyan-400 hover:text-cyan-300 transition-colors">Edit</button>
                        {canDelete && (
                          <button onClick={() => handleDelete(s.id)} className="text-rose-400 hover:text-rose-300 transition-colors">Delete</button>
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
