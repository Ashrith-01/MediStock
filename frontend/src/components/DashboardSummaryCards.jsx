import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosInstance'

export default function DashboardSummaryCards({ initialStats }) {
  const { user } = useAuth()
  const role = user?.role?.toUpperCase()

  const [stats, setStats] = useState(
    initialStats || {
      total: 0,
      lowStock: 0,
      outOfStock: 0,
      expiring: 0,
      suppliers: 0,
    }
  )
  const [loading, setLoading] = useState(!initialStats)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialStats) {
      setStats(initialStats)
      setLoading(false)
      return
    }

    let isMounted = true
    const fetchStats = async () => {
      try {
        const [allRes, lowRes, outRes, expiringRes, suppliersRes] = await Promise.allSettled([
          api.get('/medicines'),
          api.get('/medicines/low-stock'),
          api.get('/medicines/out-of-stock'),
          api.get('/medicines/expiring', { params: { days: 30 } }),
          api.get('/suppliers'),
        ])

        if (!isMounted) return

        setStats({
          total: allRes.status === 'fulfilled' ? allRes.value.data?.length || 0 : 0,
          lowStock: lowRes.status === 'fulfilled' ? lowRes.value.data?.length || 0 : 0,
          outOfStock: outRes.status === 'fulfilled' ? outRes.value.data?.length || 0 : 0,
          expiring: expiringRes.status === 'fulfilled' ? expiringRes.value.data?.length || 0 : 0,
          suppliers: suppliersRes.status === 'fulfilled' ? suppliersRes.value.data?.length || 0 : 0,
        })
      } catch (err) {
        if (isMounted) setError('Failed to load inventory summary metrics.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchStats()
    return () => {
      isMounted = false
    }
  }, [initialStats])

  const isAllowed = ['ADMIN', 'PHARMACIST', 'STAFF'].includes(role)
  if (!isAllowed) {
    return null
  }

  const cardItems = [
    {
      label: 'Total Medicines',
      value: stats.total,
      description: 'Items in catalog',
      link: '/medicines',
      icon: (
        <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      glow: 'shadow-glow-cyan border-cyan-500/30',
      iconBg: 'bg-cyan-500/10 border border-cyan-500/20',
    },
    {
      label: 'Low Stock Alerts',
      value: stats.lowStock,
      description: 'Below min threshold',
      link: '/medicines?stockStatus=LOW_STOCK',
      icon: (
        <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      glow: 'border-amber-500/30',
      iconBg: 'bg-amber-500/10 border border-amber-500/20',
    },
    {
      label: 'Out of Stock',
      value: stats.outOfStock,
      description: 'Zero quantity remaining',
      link: '/medicines?stockStatus=OUT_OF_STOCK',
      icon: (
        <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      ),
      glow: 'border-rose-500/30',
      iconBg: 'bg-rose-500/10 border border-rose-500/20',
    },
    {
      label: 'Expiring Soon',
      value: stats.expiring,
      description: 'Expiring in 30 days',
      link: '/medicines',
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      glow: 'border-orange-500/30',
      iconBg: 'bg-orange-500/10 border border-orange-500/20',
    },
    {
      label: 'Active Suppliers',
      value: stats.suppliers,
      description: 'Registered partners',
      link: '/suppliers',
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      glow: 'shadow-glow-emerald border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="h-4 bg-slate-800 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-700 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {error && <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cardItems.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className={`group relative overflow-hidden bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-lg hover:border-slate-700 hover:bg-slate-900/90 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${card.glow}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {card.label}
              </span>
              <div className={`p-2.5 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-100 tracking-tight">
                {card.value}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
