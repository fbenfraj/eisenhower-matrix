import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, AuthResponse } from '../services/auth'
import {
  getStoredToken,
  getStoredUser,
  login as authLogin,
  register as authRegister,
  logout as authLogout
} from '../services/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = getStoredToken()
    const storedUser = getStoredUser()
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  const handleAuthResponse = (response: AuthResponse) => {
    setUser(response.user)
    setToken(response.token)
  }

  const login = async (email: string, password: string) => {
    const response = await authLogin(email, password)
    handleAuthResponse(response)
  }

  const register = async (email: string, password: string) => {
    const response = await authRegister(email, password)
    handleAuthResponse(response)
  }

  const logout = () => {
    authLogout()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
