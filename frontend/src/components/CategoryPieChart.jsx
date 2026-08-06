import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosInstance'

const COLORS = ['#38BDF8', '#818CF8', '#A78BFA', '#F472B6', '#FBBF24', '#34D399', '#2DD4BF', '#FB7185']

export default function CategoryPieChart() {
  const { user } = useAuth()
  const role = user?.role?.toUpperCase()

  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isAllowed = ['ADMIN', 'PHARMACIST'].includes(role)

  useEffect(() => {
    if (!isAllowed) return

    let isMounted = true
    const fetchData = async () => {
      try {
        const [medsRes] = await Promise.all([
          api.get('/medicines'),
        ])

        if (!isMounted) return

        const medicines = medsRes.data || []

        const catMap = {}
        medicines.forEach((med) => {
          const catName = med.categoryName || 'General / Other'
          if (!catMap[catName]) {
            catMap[catName] = { name: catName, value: 0, totalQty: 0 }
          }
          catMap[catName].value += 1
          catMap[catName].totalQty += med.quantity || 0
        })

        const formatted = Object.values(catMap)
        setChartData(formatted)
      } catch (err) {
        if (isMounted) setError('Could not load category distribution.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [isAllowed])

  if (!isAllowed) {
    return null
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-slate-100 p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
          <p className="font-bold text-sm text-cyan-400">{data.name}</p>
          <div className="mt-1 space-y-0.5 text-slate-300">
            <p>
              Medicines: <span className="font-semibold text-slate-100">{data.value} items</span>
            </p>
            <p>
              Total Stock: <span className="font-semibold text-emerald-400">{data.totalQty} units</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-100">Category Breakdown</h3>
            <p className="text-xs text-slate-400">Medicine catalog distribution by category</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {role === 'ADMIN' ? 'Admin & Pharmacist' : 'Pharmacist View'}
          </span>
        </div>

        {error && <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl mb-3 border border-rose-500/20">{error}</div>}

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm animate-pulse">
            Loading category chart...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
            <svg className="w-10 h-10 mb-2 opacity-30 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
            </svg>
            No category distribution available
          </div>
        ) : (
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
