import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'STAFF' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.fullName, form.email, form.password, form.role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const labelStyle = "block text-xs font-semibold text-slate-300 mb-1"
  const inputStyle = "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden py-12">
      {/* Background Orbs */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-glow-cyan mb-3">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            MediStock
          </h1>
          <p className="text-xs text-slate-400 mt-1">Create New System Account</p>
        </div>

        {error && <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelStyle}>Full Name *</label>
            <input
              type="text" name="fullName" required value={form.fullName} onChange={handleChange}
              className={inputStyle}
              placeholder="Dr. Alex Rivera"
            />
          </div>
          <div>
            <label className={labelStyle}>Email Address *</label>
            <input
              type="email" name="email" required value={form.email} onChange={handleChange}
              className={inputStyle}
              placeholder="alex@medistock.com"
            />
          </div>
          <div>
            <label className={labelStyle}>Password *</label>
            <input
              type="password" name="password" required minLength={6} value={form.password} onChange={handleChange}
              className={inputStyle}
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className={labelStyle}>Requested Role *</label>
            <select
              name="role" value={form.role} onChange={handleChange}
              className={inputStyle}
            >
              <option value="STAFF">Staff Member</option>
              <option value="PHARMACIST">Pharmacist</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-glow-cyan disabled:opacity-50 transition-all mt-2"
          >
            {loading ? 'Creating account...' : 'Register Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account? <Link to="/login" className="text-cyan-400 hover:underline font-semibold">Sign in here</Link>
        </p>
      </div>
    </div>
  )
}
