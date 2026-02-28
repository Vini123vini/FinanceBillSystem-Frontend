import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../utils/api'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('kk_token')
    if (token) {
      authAPI.me()
        .then(r => setUser(r.data.user))
        .catch(() => localStorage.removeItem('kk_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const r = await authAPI.login({ email, password })
    localStorage.setItem('kk_token', r.data.token)
    setUser(r.data.user)
    return r.data.user
  }

  const register = async (data) => {
    const r = await authAPI.register(data)
    localStorage.setItem('kk_token', r.data.token)
    setUser(r.data.user)
    return r.data.user
  }

  const logout = () => {
    localStorage.removeItem('kk_token')
    setUser(null)
    window.location.href = '/login'
  }

  const updateUser = useCallback((u) => setUser(u), [])

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
