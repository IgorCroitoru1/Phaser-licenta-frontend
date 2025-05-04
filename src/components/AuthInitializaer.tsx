'use client'

import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const {
    login,
    logout,
    setAuthLoading,
    accessToken,
    isAuthLoading,
    user,
    setUser,
  } = useAuthStore()

  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      setAuthLoading(true)

      try {
        // Try to refresh access token if missing
        if (!accessToken) {
          await authService.refreshCredentials()
        }

        // Fetch user if token exists but user not in store
        if (!user && accessToken) {
          const fetchedUser = await authService.getUser()
          setUser(fetchedUser)
        }

      } catch (error) {
        console.error('Authentication initialization failed:', error)
        await authService.logout()
        logout()
        router.push('/login')
      } finally {
        setAuthLoading(false)
      }
    }

    initializeAuth()
  }, [accessToken, user, login, logout, setAuthLoading, setUser, router])

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <>{children}</>
}
