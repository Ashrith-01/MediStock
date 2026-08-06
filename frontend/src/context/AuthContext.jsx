import React, { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axiosInstance'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('medistock_user')
    return stored ? JSON.parse(stored) : null
  })

  const persistSession = (authResponse) => {
    const { token, ...userInfo } = authResponse
    localStorage.setItem('medistock_token', token)
    localStorage.setItem('medistock_user', JSON.stringify(userInfo))
    setUser(userInfo)
  }

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    persistSession(data)
    return data
  }, [])

  const register = useCallback(async (fullName, email, password, role) => {
    const { data } = await api.post('/auth/register', { fullName, email, password, role })
    persistSession(data)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('medistock_token')
    localStorage.removeItem('medistock_user')
    setUser(null)
  }, [])

  const hasRole = useCallback((...roles) => {
    return !!user && roles.includes(user.role)
  }, [user])

  const value = { user, login, register, logout, hasRole, isAuthenticated: !!user }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
