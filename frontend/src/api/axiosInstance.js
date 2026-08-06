import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:8081/api')

const api = axios.create({
  baseURL: API_BASE_URL,
})

// attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medistock_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// auto logout on 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('medistock_token')
      localStorage.removeItem('medistock_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
