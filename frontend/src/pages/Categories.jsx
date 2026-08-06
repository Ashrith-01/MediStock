import React, { useEffect, useState, useCallback } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'

export default function Categories() {
  const { hasRole } = useAuth()
  const [categories, setCategories] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Form State
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const canManage = hasRole('ADMIN', 'PHARMACIST')
  const canDelete = hasRole('ADMIN')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [catRes, medRes] = await Promise.all([
        api.get('/categories'),
        api.get('/medicines'),
      ])
      setCategories(catRes.data || [])
      setMedicines(medRes.data || [])
    } catch (err) {
      setError('Failed to load categories. Please check if the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (cat) => {
    setEditingCategory(cat)
    setFormData({ name: cat.name || '', description: cat.description || '' })
    setFormError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData)
      } else {
        await api.post('/categories', formData)
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save category.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return
    try {
      await api.delete(`/categories/${id}`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.')
    }
  }

  const getCategoryMedicineCount = (catName) => {
    return medicines.filter((m) => m.categoryName === catName).length
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()))
  )

  const labelStyle = "block text-xs font-semibold text-slate-300 mb-1"
  const inputStyle = "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight sm:text-3xl">
              Medicine Categories
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Organize and manage pharmaceutical classifications and drug families
            </p>
          </div>
          {canManage && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-glow-cyan transition-all self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Category</span>
            </button>
          )}
        </div>

        {/* Search & Stats Bar */}
        <div className="bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <svg className="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search category name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 text-cyan-400 border border-slate-700">
              Total Categories: <strong className="text-slate-100">{categories.length}</strong>
            </span>
          </div>
        </div>

        {error && <div className="mb-6 p-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">{error}</div>}

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="h-5 bg-slate-800 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-slate-850 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-slate-800 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-12 text-center text-slate-500">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="font-bold text-slate-300">No categories found</p>
            <p className="text-xs text-slate-500 mt-1">Try refining search query or add a new category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCategories.map((cat) => {
              const medCount = getCategoryMedicineCount(cat.name)
              return (
                <div
                  key={cat.id}
                  className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-800/80 p-5 shadow-lg hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-extrabold text-slate-100 text-base group-hover:text-cyan-400 transition-colors">
                        {cat.name}
                      </h3>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                        {medCount} {medCount === 1 ? 'Medicine' : 'Medicines'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>

                  {canManage && (
                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-3 text-xs font-semibold">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Edit
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Modal for Add / Edit Category */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-800 max-w-md w-full p-6">
              <h2 className="text-lg font-extrabold text-slate-100 mb-4">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>

              {formError && (
                <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelStyle}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Analgesics, Antibiotics"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Overview of drug classification or usage..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 rounded-xl transition-colors shadow-glow-cyan"
                  >
                    {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
