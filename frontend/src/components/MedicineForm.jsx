import React, { useState, useEffect } from 'react'

const emptyForm = {
  name: '', batchNumber: '', categoryId: '', supplierId: '',
  quantity: 0, lowStockThreshold: 10, manufacturingDate: '', expiryDate: '', price: '',
}

export default function MedicineForm({ initialData, categories, suppliers, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        batchNumber: initialData.batchNumber || '',
        categoryId: initialData.categoryId || '',
        supplierId: initialData.supplierId || '',
        quantity: initialData.quantity ?? 0,
        lowStockThreshold: initialData.lowStockThreshold ?? 10,
        manufacturingDate: initialData.manufacturingDate || '',
        expiryDate: initialData.expiryDate || '',
        price: initialData.price ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [initialData])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        supplierId: form.supplierId ? Number(form.supplierId) : null,
        quantity: Number(form.quantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        price: form.price === '' ? null : Number(form.price),
        manufacturingDate: form.manufacturingDate || null,
      }
      await onSubmit(payload)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const labelStyle = "block text-xs font-semibold text-slate-300 mb-1"
  const inputStyle = "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelStyle}>Medicine Name *</label>
          <input name="name" required value={form.name} onChange={handleChange} placeholder="e.g. Amoxicillin 500mg" className={inputStyle} />
        </div>
        <div>
          <label className={labelStyle}>Batch Number *</label>
          <input name="batchNumber" required value={form.batchNumber} onChange={handleChange} placeholder="e.g. BATCH-2026-X" className={inputStyle} />
        </div>
        <div>
          <label className={labelStyle}>Category</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange} className={inputStyle}>
            <option value="">— Select Category —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle}>Supplier</label>
          <select name="supplierId" value={form.supplierId} onChange={handleChange} className={inputStyle}>
            <option value="">— Select Supplier —</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle}>Quantity *</label>
          <input type="number" min={0} name="quantity" required value={form.quantity} onChange={handleChange} className={inputStyle} />
        </div>
        <div>
          <label className={labelStyle}>Low Stock Threshold</label>
          <input type="number" min={0} name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleChange} className={inputStyle} />
        </div>
        <div>
          <label className={labelStyle}>Manufacturing Date</label>
          <input type="date" name="manufacturingDate" value={form.manufacturingDate} onChange={handleChange} className={inputStyle} />
        </div>
        <div>
          <label className={labelStyle}>Expiry Date *</label>
          <input type="date" name="expiryDate" required value={form.expiryDate} onChange={handleChange} className={inputStyle} />
        </div>
        <div>
          <label className={labelStyle}>Unit Price (₹)</label>
          <input type="number" min={0} step="0.01" name="price" value={form.price} onChange={handleChange} placeholder="0.00" className={inputStyle} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors shadow-glow-cyan">
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
