import React, { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const getStoredAuth = () => {
  if (typeof window === 'undefined') return { user: null, token: null }
  const storedUser = window.localStorage.getItem('medistock-user')
  const storedToken = window.localStorage.getItem('medistock-token')
  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredAuth().user)
  const [token, setToken] = useState(() => getStoredAuth().token)

  const value = useMemo(
    () => ({
      user,
      token,
      login: (data) => {
        const formattedUser = {
          email: data.email,
          role: data.role,
          firstName: data.firstName,
        }
        setUser(formattedUser)
        setToken(data.token)
        window.localStorage.setItem('medistock-user', JSON.stringify(formattedUser))
        window.localStorage.setItem('medistock-token', data.token)
      },
      logout: () => {
        setUser(null)
        setToken(null)
        window.localStorage.removeItem('medistock-user')
        window.localStorage.removeItem('medistock-token')
      },
    }),
    [user, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
