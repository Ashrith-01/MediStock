import React, { useEffect, useState, useCallback } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/users')
      setUsers(data || [])
    } catch (err) {
      setError(
        err.response?.status === 403
          ? 'Access denied. Only Administrators can access User Management.'
          : 'Failed to load users. Is the backend server running?'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId)
    setStatusMessage(null)
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole })
      setStatusMessage({ type: 'success', text: `User role updated to ${newRole} successfully!` })
      fetchUsers()
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update user role.',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleToggleStatus = async (userId, currentEnabled) => {
    const nextEnabled = !currentEnabled
    const actionText = nextEnabled ? 'enable' : 'disable'
    
    if (!window.confirm(`Are you sure you want to ${actionText} this user account?`)) return

    setUpdatingId(userId)
    setStatusMessage(null)
    try {
      await api.patch(`/users/${userId}/status`, { enabled: nextEnabled })
      setStatusMessage({
        type: 'success',
        text: `Account has been ${nextEnabled ? 'enabled' : 'disabled'} successfully!`,
      })
      fetchUsers()
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || `Failed to ${actionText} user account.`,
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.enabled) ||
      (statusFilter === 'DISABLED' && !u.enabled)

    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Admin Access Only
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight sm:text-3xl">
            User Account Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            View system users, assign role authorizations, and control account activation status.
          </p>
        </div>

        {/* Feedback Banner */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center justify-between text-xs font-medium shadow-lg transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="font-bold opacity-70 hover:opacity-100">
              Dismiss
            </button>
          </div>
        )}

        {error && <div className="mb-6 p-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">{error}</div>}

        {/* Filter Controls */}
        <div className="bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <svg className="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by full name or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs font-semibold border border-slate-800 rounded-xl px-3 py-2 bg-slate-950 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold border border-slate-800 rounded-xl px-3 py-2 bg-slate-950 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="DISABLED">Disabled Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Accounts Table */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm animate-pulse">
              Loading user accounts directory...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <svg className="w-12 h-12 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="font-bold text-slate-300">No user accounts found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting search parameters or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                    <th className="py-3.5 px-4 rounded-l-lg">User Details</th>
                    <th className="py-3.5 px-4">Role Authorization</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4 text-center rounded-r-lg">Account Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredUsers.map((u) => {
                    const isSelf = currentUser && currentUser.email === u.email
                    const isUpdating = updatingId === u.id

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold flex items-center justify-center text-sm shrink-0">
                              {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-100 flex items-center gap-1.5">
                                {u.fullName}
                                {isSelf && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <select
                            disabled={isSelf || isUpdating}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="text-xs font-bold border border-slate-800 rounded-xl px-3 py-1.5 bg-slate-950 text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="PHARMACIST">PHARMACIST</option>
                            <option value="STAFF">STAFF</option>
                          </select>
                        </td>

                        <td className="py-4 px-4">
                          {u.enabled ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Disabled
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-xs text-slate-400 font-medium">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <button
                            disabled={isSelf || isUpdating}
                            onClick={() => handleToggleStatus(u.id, u.enabled)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all disabled:opacity-50 ${
                              u.enabled
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            {isUpdating
                              ? 'Saving...'
                              : u.enabled
                              ? 'Disable Account'
                              : 'Enable Account'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
