import React, { useState, useEffect } from 'react'

const emptyForm = { name: '', contactNumber: '', email: '', address: '' }

export default function SupplierForm({ initialData, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        contactNumber: initialData.contactNumber || '',
        email: initialData.email || '',
        address: initialData.address || '',
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
      await onSubmit(form)
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
      <div>
        <label className={labelStyle}>Supplier Name *</label>
        <input name="name" required value={form.name} onChange={handleChange} placeholder="e.g. PharmaCorp Global" className={inputStyle} />
      </div>
      <div>
        <label className={labelStyle}>Contact Number</label>
        <input name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="+1 555 019 2831" className={inputStyle} />
      </div>
      <div>
        <label className={labelStyle}>Email Address</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="orders@pharmacorp.com" className={inputStyle} />
      </div>
      <div>
        <label className={labelStyle}>Address</label>
        <textarea name="address" rows={2} value={form.address} onChange={handleChange} placeholder="Supplier headquarters / warehouse address..." className={inputStyle} />
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
