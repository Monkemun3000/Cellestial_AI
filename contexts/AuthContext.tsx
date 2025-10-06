'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { AuthService } from '@/services/authService'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<User>
  createAccountWithEmail: (email: string, password: string, displayName?: string) => Promise<User>
  signInWithGoogle: () => Promise<User>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithEmail = async (email: string, password: string): Promise<User> => {
    setLoading(true)
    try {
      const user = await AuthService.signInWithEmail(email, password)
      return user
    } finally {
      setLoading(false)
    }
  }

  const createAccountWithEmail = async (email: string, password: string, displayName?: string): Promise<User> => {
    setLoading(true)
    try {
      const user = await AuthService.createAccountWithEmail(email, password, displayName)
      return user
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async (): Promise<User> => {
    setLoading(true)
    try {
      const user = await AuthService.signInWithGoogle()
      return user
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    setLoading(true)
    try {
      await AuthService.signOut()
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signInWithEmail,
    createAccountWithEmail,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

