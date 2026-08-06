import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MedicineForm from '../components/MedicineForm'
import api from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'

const STATUS_BADGE = {
  IN_STOCK: 'bg-green-100 text-green-700',
  LOW_STOCK: 'bg-yellow-100 text-yellow-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
}

export default function Medicines() {
  const { hasRole } = useAuth()
  const [searchParams] = useSearchParams()

  const [medicines, setMedicines] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [stockAdjustment, setStockAdjustment] = useState(null)
  const [stockSaving, setStockSaving] = useState(false)

  const [filters, setFilters] = useState({
    name: '',
    batchNumber: '',
    categoryId: '',
    supplierId: '',
    stockStatus: searchParams.get('stockStatus') || '',
  })

  const canManage = hasRole('ADMIN', 'PHARMACIST')

  const loadLookups = useCallback(async () => {
    const [catRes, supRes] = await Promise.all([api.get('/categories'), api.get('/suppliers')])
    setCategories(catRes.data)
    setSuppliers(supRes.data)
  }, [])

  const loadMedicines = useCallback(async (activeFilters) => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) params[key] = value
      })
      const { data } = await api.get('/medicines', { params })
      setMedicines(data)
    } catch (err) {
      setError('Failed to load medicines. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadLookups() }, [loadLookups])
  useEffect(() => { loadMedicines(filters) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })

  const applyFilters = (e) => {
    e.preventDefault()
    loadMedicines(filters)
  }

  const clearFilters = () => {
    const cleared = { name: '', batchNumber: '', categoryId: '', supplierId: '', stockStatus: '' }
    setFilters(cleared)
    loadMedicines(cleared)
  }

  const openCreate = () => { setEditingMedicine(null); setShowForm(true) }
  const openEdit = (medicine) => { setEditingMedicine(medicine); setShowForm(true) }
  const openStockAdjustment = (medicine) => {
    setStockAdjustment({ id: medicine.id, name: medicine.name, delta: 1, note: '' })
  }

  const handleSubmit = async (payload) => {
    if (editingMedicine) {
      await api.put(`/medicines/${editingMedicine.id}`, payload)
    } else {
      await api.post('/medicines', payload)
    }
    setShowForm(false)
    loadMedicines(filters)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine record? This cannot be undone.')) return
    try {
      await api.delete(`/medicines/${id}`)
      loadMedicines(filters)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete medicine.')
    }
  }

  const handleStockAdjustment = async (e) => {
    e.preventDefault()
    if (!stockAdjustment) return
    setStockSaving(true)
    setError('')
    try {
      await api.patch(`/medicines/${stockAdjustment.id}/stock`, {
        delta: Number(stockAdjustment.delta),
        note: stockAdjustment.note.trim() || 'Stock adjusted from inventory UI',
      })
      setStockAdjustment(null)
      loadMedicines(filters)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock.')
    } finally {
      setStockSaving(false)
    }
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Medicine Inventory</h1>
          {canManage && (
            <button onClick={openCreate} className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-700">
              + Add Medicine
            </button>
          )}
        </div>

        <form onSubmit={applyFilters} className="mb-6 bg-white border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <input name="name" value={filters.name} onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Batch #</label>
            <input name="batchNumber" value={filters.batchNumber} onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">All</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Supplier</label>
            <select name="supplierId" value={filters.supplierId} onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">All</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Stock Status</label>
            <select name="stockStatus" value={filters.stockStatus} onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">All</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-brand-600 text-white rounded-md px-3 py-1.5 text-sm font-medium hover:bg-brand-700">
              Filter
            </button>
            <button type="button" onClick={clearFilters} className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
              Clear
            </button>
          </div>
        </form>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

        {stockAdjustment && (
          <form onSubmit={handleStockAdjustment} className="mb-6 bg-white border rounded-xl p-4 flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Adjust stock for</label>
              <div className="text-sm font-medium text-gray-800">{stockAdjustment.name}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Quantity change</label>
              <input type="number" value={stockAdjustment.delta} onChange={(e) => setStockAdjustment({ ...stockAdjustment, delta: e.target.value })}
                className="w-28 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="min-w-[240px] flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Note</label>
              <input value={stockAdjustment.note} onChange={(e) => setStockAdjustment({ ...stockAdjustment, note: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Restock / damage / transfer" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={stockSaving} className="bg-brand-600 text-white rounded-md px-3 py-1.5 text-sm font-medium hover:bg-brand-700 disabled:opacity-50">
                {stockSaving ? 'Saving...' : 'Save adjustment'}
              </button>
              <button type="button" onClick={() => setStockAdjustment(null)} className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}

        {showForm && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold text-gray-800 mb-4">{editingMedicine ? 'Edit Medicine' : 'New Medicine'}</h2>
            <MedicineForm
              initialData={editingMedicine}
              categories={categories}
              suppliers={suppliers}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              submitLabel={editingMedicine ? 'Update Medicine' : 'Create Medicine'}
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          {loading ? (
            <p className="p-6 text-gray-500">Loading medicines...</p>
          ) : medicines.length === 0 ? (
            <p className="p-6 text-gray-500">No medicines found.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Batch #</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Supplier</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Expiry</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
                  {canManage && <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {medicines.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{m.name}</td>
                    <td className="px-4 py-3 text-gray-600">{m.batchNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{m.categoryName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{m.supplierName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{m.quantity}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {m.expiryDate}
                      {m.expired && <span className="ml-2 text-xs text-red-600 font-medium">Expired</span>}
                      {!m.expired && m.nearExpiry && <span className="ml-2 text-xs text-orange-600 font-medium">Near expiry</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[m.stockStatus]}`}>
                        {m.stockStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.price != null ? `₹${m.price}` : '—'}</td>
                    {canManage && (
                      <td className="px-4 py-3 text-right space-x-3">
                        <button onClick={() => openStockAdjustment(m)} className="text-emerald-600 hover:text-emerald-700 font-medium">Adjust</button>
                        <Link to={`/medicines/${m.id}/history`} className="text-sky-600 hover:text-sky-700 font-medium">History</Link>
                        <button onClick={() => openEdit(m)} className="text-brand-600 hover:text-brand-700 font-medium">Edit</button>
                        <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-700 font-medium">Delete</button>
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
