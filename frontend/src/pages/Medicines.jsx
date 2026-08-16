import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MedicineForm from '../components/MedicineForm'
import QRScanner from '../components/QRScanner'
import api from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'
import { QRCodeCanvas } from 'qrcode.react'

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
  const [showScanner, setShowScanner] = useState(false)
  const [scannedMedicine, setScannedMedicine] = useState(null)
  const [qrMedicine, setQrMedicine] = useState(null)
  const [scanLoading, setScanLoading] = useState(false)
  const scanLoadingRef = useRef(false)

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

  const downloadQR = () => {
    if (!qrMedicine) return
    const canvas = document.getElementById('medicine-qr-canvas')
    if (!canvas) return
    const pngUrl = canvas.toDataURL('image/png')
    const downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `QR_${qrMedicine.name}_${qrMedicine.batchNumber}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  const handlePrintQR = () => {
    if (!qrMedicine) return
    const canvas = document.getElementById('medicine-qr-canvas')
    const qrDataUrl = canvas ? canvas.toDataURL('image/png') : ''
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Label - ${qrMedicine.name}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: #fff;
            }
            .label-card {
              border: 2px solid #0f172a;
              padding: 24px;
              border-radius: 16px;
              text-align: center;
              width: 280px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .title { font-size: 20px; font-weight: 800; margin-top: 12px; color: #0f172a; }
            .subtitle { font-size: 13px; color: #475569; margin-bottom: 12px; font-family: monospace; font-weight: bold; }
            .details { font-size: 12px; text-align: left; border-top: 1px dashed #cbd5e1; padding-top: 10px; margin-top: 10px; color: #334155; }
            .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="label-card">
            ${qrDataUrl ? `<img src="${qrDataUrl}" width="190" height="190" alt="QR Code" />` : ''}
            <div class="title">${qrMedicine.name}</div>
            <div class="subtitle">Batch #: ${qrMedicine.batchNumber}</div>
            <div class="details">
              <div class="row"><span>Category:</span> <span class="bold">${qrMedicine.categoryName || '—'}</span></div>
              <div class="row"><span>Expiry Date:</span> <span class="bold">${qrMedicine.expiryDate}</span></div>
              <div class="row"><span>Price:</span> <span class="bold">${qrMedicine.price != null ? '₹' + qrMedicine.price : '—'}</span></div>
              <div class="row"><span>Quantity:</span> <span class="bold">${qrMedicine.quantity}</span></div>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleQRScan = useCallback(async (decodedText) => {
    if (scanLoadingRef.current) return
    scanLoadingRef.current = true
    setScanLoading(true)
    setError('')

    try {
      const rawText = (decodedText || '').trim()
      if (!rawText) {
        throw new Error('Scanned QR code is empty.')
      }

      let medicineData = null
      let parsedId = null
      let parsedBatch = null
      let parsedName = null

      // 1. Check if structured JSON string (e.g. {"id": 1} or {"batchNumber": "B-101"})
      if (rawText.startsWith('{') && rawText.endsWith('}')) {
        try {
          const parsed = JSON.parse(rawText)
          if (parsed.id) parsedId = Number(parsed.id)
          if (parsed.batchNumber) parsedBatch = String(parsed.batchNumber).trim()
          if (parsed.name) parsedName = String(parsed.name).trim()
        } catch (e) {
          // ignore
        }
      }

      // 2. Check if URL containing ID (e.g. http://localhost:5173/medicines/1)
      if (!parsedId && !parsedBatch && (rawText.startsWith('http://') || rawText.startsWith('https://'))) {
        const parts = rawText.split('?')[0].split('/')
        const lastPart = parts[parts.length - 1]
        if (Number.isInteger(Number(lastPart))) {
          parsedId = Number(lastPart)
        }
      }

      // Priority 1: Exact Database Primary Key ID Lookup (if numeric input or parsed ID)
      const targetId = parsedId || (Number.isInteger(Number(rawText)) && Number(rawText) > 0 ? Number(rawText) : null)
      if (targetId) {
        try {
          const { data } = await api.get(`/medicines/${targetId}`)
          if (data && data.id) {
            medicineData = data
          }
        } catch (err) {
          console.warn(`Database ID ${targetId} lookup failed:`, err)
        }
      }

      // Priority 2: Batch Number Lookup (STRICT exact match required)
      if (!medicineData) {
        const targetBatch = parsedBatch || rawText
        try {
          const { data } = await api.get('/medicines', { params: { batchNumber: targetBatch } })
          if (Array.isArray(data) && data.length > 0) {
            // Require EXACT batch number match (case-insensitive) to prevent SQL LIKE '%X%' false matches
            const exactMatch = data.find(m => m.batchNumber && m.batchNumber.trim().toLowerCase() === targetBatch.toLowerCase())
            if (exactMatch) {
              medicineData = exactMatch
            }
          }
        } catch (err) {
          console.warn(`Batch '${targetBatch}' lookup failed:`, err)
        }
      }

      // Priority 3: Medicine Name Lookup (STRICT exact match required)
      if (!medicineData) {
        const targetName = parsedName || rawText
        try {
          const { data } = await api.get('/medicines', { params: { name: targetName } })
          if (Array.isArray(data) && data.length > 0) {
            // Require EXACT name match (case-insensitive)
            const exactMatch = data.find(m => m.name && m.name.trim().toLowerCase() === targetName.toLowerCase())
            if (exactMatch) {
              medicineData = exactMatch
            }
          }
        } catch (err) {
          console.warn(`Name '${targetName}' lookup failed:`, err)
        }
      }

      if (!medicineData) {
        throw new Error(`No medicine found for scanned code: "${rawText}"`)
      }

      setScannedMedicine(medicineData)
      setShowScanner(false)

      // Filter catalog list by batch number to isolate the scanned medicine
      const updatedFilters = {
        name: '',
        batchNumber: medicineData.batchNumber || '',
        categoryId: '',
        supplierId: '',
        stockStatus: ''
      }
      setFilters(updatedFilters)
      loadMedicines(updatedFilters)
    } catch (err) {
      console.error('Medicine scan error:', err)
      setError(
        err.message ||
        err.response?.data?.message ||
        'Medicine not found for this QR code.'
      )
    } finally {
      scanLoadingRef.current = false
      setScanLoading(false)
    }
  }, [loadMedicines])

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
          <div className="flex flex-wrap gap-2">
            {showScanner ? (
              <button
                onClick={() => setShowScanner(false)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-rose-500 flex items-center gap-1.5"
              >
                ✕ Close Scanner
              </button>
            ) : (
              <button
                onClick={() => setShowScanner(true)}
                className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-cyan-500 flex items-center gap-1.5"
              >
                📷 Scan Medicine
              </button>
            )}

            {canManage && (
              <button
                onClick={openCreate}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-glow-cyan transition-all hover:from-cyan-400 hover:to-indigo-500"
              >
                + Add Medicine
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 shadow-lg">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} className="ml-2 font-bold hover:text-white">✕</button>
          </div>
        )}

        {/* Scanned Medicine Display Card */}
        {scannedMedicine && (
          <div className="mb-6 rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔍</span>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Scanned Medicine Details</h3>
                  <p className="text-xs text-slate-400">QR Code match found in catalog</p>
                </div>
              </div>
              <button
                onClick={() => setScannedMedicine(null)}
                className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition"
              >
                ✕ Dismiss
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Name</span>
                <span className="font-bold text-cyan-400 text-base">{scannedMedicine.name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Batch Number</span>
                <span className="font-mono text-slate-200">{scannedMedicine.batchNumber}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Category</span>
                <span className="text-slate-200">{scannedMedicine.categoryName || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Supplier</span>
                <span className="text-slate-200">{scannedMedicine.supplierName || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Quantity</span>
                <span className="font-bold text-slate-100">{scannedMedicine.quantity}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Expiry Date</span>
                <span className="text-slate-200">{scannedMedicine.expiryDate}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Status</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_BADGE[scannedMedicine.stockStatus]}`}>
                  {scannedMedicine.stockStatus?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Price</span>
                <span className="font-semibold text-emerald-400">{scannedMedicine.price != null ? `₹${scannedMedicine.price}` : '—'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex justify-end gap-2">
              <button
                onClick={() => setQrMedicine(scannedMedicine)}
                className="rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition flex items-center gap-1.5"
              >
                🖨️ Print QR
              </button>
              {canManage && (
                <>
                  <button
                    onClick={() => openStockAdjustment(scannedMedicine)}
                    className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
                  >
                    Adjust Stock
                  </button>
                  <button
                    onClick={() => openEdit(scannedMedicine)}
                    className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition"
                  >
                    Edit Medicine
                  </button>
                </>
              )}
            </div>
          </div>
        )}

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
                  <th className="py-3.5 px-4 text-right rounded-r-lg">Actions</th>
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
                    <td className="py-3.5 px-4 text-right space-x-3 text-xs font-semibold">
                      <button onClick={() => setQrMedicine(m)} className="text-amber-400 hover:text-amber-300 transition-colors">Print QR</button>
                      {canManage && (
                        <>
                          <button onClick={() => openStockAdjustment(m)} className="text-emerald-400 hover:text-emerald-300 transition-colors">Adjust</button>
                          <Link to={`/medicines/${m.id}/history`} className="text-cyan-400 hover:text-cyan-300 transition-colors">History</Link>
                          <button onClick={() => openEdit(m)} className="text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
                          <button onClick={() => handleDelete(m.id)} className="text-rose-400 hover:text-rose-300 transition-colors">Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* QR Scanner Modal */}
        {showScanner && (
          <QRScanner
            onScan={handleQRScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Print QR Label Modal */}
        {qrMedicine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-5 text-center">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🖨️</span> Print Medicine QR Label
                </h3>
                <button
                  onClick={() => setQrMedicine(null)}
                  className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 font-bold"
                >
                  ✕ Close
                </button>
              </div>

              {/* Printable Label Badge */}
              <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-inner space-y-3 flex flex-col items-center border border-slate-200">
                <div className="p-2 border-2 border-slate-900 rounded-xl bg-white">
                  <QRCodeCanvas
                    id="medicine-qr-canvas"
                    value={String(qrMedicine.id)}
                    size={190}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">{qrMedicine.name}</h4>
                  <p className="text-xs font-mono font-bold text-slate-600 uppercase">Batch #: {qrMedicine.batchNumber}</p>
                </div>

                <div className="w-full pt-2 border-t border-slate-200 grid grid-cols-2 text-left text-xs gap-2 text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-500 block">Category:</span>
                    <span className="font-bold text-slate-900">{qrMedicine.categoryName || '—'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Expiry Date:</span>
                    <span className="font-bold text-slate-900">{qrMedicine.expiryDate}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Price:</span>
                    <span className="font-bold text-emerald-700">{qrMedicine.price != null ? `₹${qrMedicine.price}` : '—'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Stock Qty:</span>
                    <span className="font-bold text-slate-900">{qrMedicine.quantity}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={downloadQR}
                  className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
                >
                  📥 Download Image
                </button>
                <button
                  onClick={handlePrintQR}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:from-amber-400 hover:to-orange-500 transition"
                >
                  🖨️ Print Label
                </button>
              </div>

            </div>
          </div>
        )}


      </main>
    </div>
  )
}