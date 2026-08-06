import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MedicineForm from '../components/MedicineForm'
import api from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'

const STATUS_BADGE = {
  IN_STOCK: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  LOW_STOCK: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  OUT_OF_STOCK: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
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
    try {
      const [catRes, supRes] = await Promise.all([api.get('/categories'), api.get('/suppliers')])
      setCategories(catRes.data || [])
      setSuppliers(supRes.data || [])
    } catch (err) {
      console.error('Failed to load lookup data:', err)
    }
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
      setMedicines(data || [])
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

  const inputStyle = "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight sm:text-3xl">Medicine Inventory</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage pharmaceutical catalog items and stock levels</p>
          </div>
          {canManage && (
            <button onClick={openCreate} className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-glow-cyan transition-all">
              + Add Medicine
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <form onSubmit={applyFilters} className="mb-6 bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end shadow-lg">
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Name</label>
            <input name="name" value={filters.name} onChange={handleFilterChange} placeholder="Filter by name..." className={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Batch #</label>
            <input name="batchNumber" value={filters.batchNumber} onChange={handleFilterChange} placeholder="Filter by batch..." className={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
            <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className={inputStyle}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Supplier</label>
            <select name="supplierId" value={filters.supplierId} onChange={handleFilterChange} className={inputStyle}>
              <option value="">All Suppliers</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Stock Status</label>
            <select name="stockStatus" value={filters.stockStatus} onChange={handleFilterChange} className={inputStyle}>
              <option value="">All Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors">
              Filter
            </button>
            <button type="button" onClick={clearFilters} className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors">
              Clear
            </button>
          </div>
        </form>

        {error && <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</div>}

        {/* Stock Adjustment Drawer */}
        {stockAdjustment && (
          <form onSubmit={handleStockAdjustment} className="mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-end shadow-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Adjust Stock For</label>
              <div className="text-sm font-bold text-cyan-400">{stockAdjustment.name}</div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Delta (+ / -)</label>
              <input type="number" value={stockAdjustment.delta} onChange={(e) => setStockAdjustment({ ...stockAdjustment, delta: e.target.value })}
                className="w-28 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500" />
            </div>
            <div className="min-w-[240px] flex-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Note / Reason</label>
              <input value={stockAdjustment.note} onChange={(e) => setStockAdjustment({ ...stockAdjustment, note: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500" placeholder="Restock / damage / sale" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={stockSaving} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-3 py-1.5 text-xs font-semibold disabled:opacity-50 transition-colors">
                {stockSaving ? 'Saving...' : 'Save adjustment'}
              </button>
              <button type="button" onClick={() => setStockAdjustment(null)} className="bg-slate-800 text-slate-300 hover:text-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Medicine Form Drawer */}
        {showForm && (
          <div className="mb-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
            <h2 className="font-extrabold text-slate-100 text-base mb-4">{editingMedicine ? 'Edit Medicine' : 'New Medicine Registration'}</h2>
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

        {/* Table */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-lg overflow-x-auto">
          {loading ? (
            <p className="p-8 text-center text-slate-500 text-sm animate-pulse">Loading medicine catalog...</p>
          ) : medicines.length === 0 ? (
            <p className="p-8 text-center text-slate-500 text-sm">No medicines matching criteria found.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                  <th className="py-3.5 px-4 rounded-l-lg">Name</th>
                  <th className="py-3.5 px-4">Batch #</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4 text-right">Qty</th>
                  <th className="py-3.5 px-4">Expiry</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Price</th>
                  {canManage && <th className="py-3.5 px-4 text-right rounded-r-lg">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {medicines.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-100">{m.name}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{m.batchNumber}</td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs">{m.categoryName || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs">{m.supplierName || '—'}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-100">{m.quantity}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {m.expiryDate}
                      {m.expired && <span className="ml-2 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded-md">Expired</span>}
                      {!m.expired && m.nearExpiry && <span className="ml-2 text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-1.5 py-0.5 rounded-md">Near Expiry</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[m.stockStatus]}`}>
                        {m.stockStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-400 text-xs">{m.price != null ? `₹${m.price}` : '—'}</td>
                    {canManage && (
                      <td className="py-3.5 px-4 text-right space-x-3 text-xs font-semibold">
                        <button onClick={() => openStockAdjustment(m)} className="text-emerald-400 hover:text-emerald-300 transition-colors">Adjust</button>
                        <Link to={`/medicines/${m.id}/history`} className="text-cyan-400 hover:text-cyan-300 transition-colors">History</Link>
                        <button onClick={() => openEdit(m)} className="text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(m.id)} className="text-rose-400 hover:text-rose-300 transition-colors">Delete</button>
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
