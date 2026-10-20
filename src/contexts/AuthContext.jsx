/* eslint-disable react-refresh/only-export-components -- Context provider and hook intentionally share this module. */
import { createContext, useContext, useState } from 'react'
import { STORAGE_KEYS } from '../features/auth/constants'
import { loginApi, registerApi, logoutApi } from '../features/auth/services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      null
    )
  })

  const [user, setUser] = useState(() => {
    const raw =
      localStorage.getItem(STORAGE_KEYS.ACCOUNT) ||
      sessionStorage.getItem(STORAGE_KEYS.ACCOUNT)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(false)

  const saveAuthData = (tokenValue, accountValue, remember = true) => {
    const storage = remember ? localStorage : sessionStorage
    const otherStorage = remember ? sessionStorage : localStorage

    // Xóa từ storage kia để tránh xung đột
    otherStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    otherStorage.removeItem(STORAGE_KEYS.ACCOUNT)

    storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokenValue)
    storage.setItem(STORAGE_KEYS.ACCOUNT, JSON.stringify(accountValue))

    setToken(tokenValue)
    setUser(accountValue)
  }

  const clearAuthData = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT)
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.ACCOUNT)

    setToken(null)
    setUser(null)
  }

  const login = async ({ username, password, rememberMe = false }) => {
    setLoading(true)
    try {
      const response = await loginApi({ username, password, rememberMe })
      const { accessToken, account } = response.data
      saveAuthData(accessToken, account, rememberMe)
      return { success: true, data: response.data }
    } finally {
      setLoading(false)
    }
  }

  const register = async (formData) => {
    setLoading(true)
    try {
      const response = await registerApi(formData)
      const { accessToken, account } = response.data
      // Mặc định lưu localStorage cho người dùng mới đăng ký
      saveAuthData(accessToken, account, true)
      return { success: true, data: response.data }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      if (token) {
        await logoutApi().catch(() => {})
      }
    } finally {
      clearAuthData()
      setLoading(false)
    }
  }

  const updateUserProfile = (updatedProfile) => {
    setUser((prev) => {
      if (!prev) return prev
      const newAccount = {
        ...prev,
        email: updatedProfile.email || prev.email,
        userProfile: {
          ...(prev.userProfile || {}),
          fullName:
            updatedProfile.fullName !== undefined
              ? updatedProfile.fullName
              : prev.userProfile?.fullName,
          phoneNumber:
            updatedProfile.phoneNumber !== undefined
              ? updatedProfile.phoneNumber
              : prev.userProfile?.phoneNumber,
          address:
            updatedProfile.defaultAddress !== undefined
              ? updatedProfile.defaultAddress
              : prev.userProfile?.address,
        },
      }
      const isRemember = !!localStorage.getItem(STORAGE_KEYS.ACCOUNT)
      const targetStorage = isRemember ? localStorage : sessionStorage
      targetStorage.setItem(STORAGE_KEYS.ACCOUNT, JSON.stringify(newAccount))
      return newAccount
    })
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        role: user?.role || null,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
