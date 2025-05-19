'use client'

import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

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

  const [canRender, setCanRender] = useState(false)

  const router = useRouter()
  const publicRoutes = ['/login', '/register']
  const pathname = usePathname()

  useEffect(() => {
    const initializeAuth = async () => {
      setAuthLoading(true)

      try {
        // Refresh token if needed
        if (!accessToken) {
          await authService.refreshCredentials()
        }

        // Fetch user if token exists but user not yet loaded
        if (!user && accessToken) {
          const fetchedUser = await authService.getUser()
          setUser(fetchedUser)
        }

        setCanRender(true)

      } catch (error) {
        console.error('Auth init failed:', error)
        await authService.logout()
        logout()
        if (pathname && !publicRoutes.includes(pathname)) {
          router.replace('/login') // 🚫 replace prevents back button flash
        } else {
          setCanRender(true)
        }
      } finally {
        setAuthLoading(false)
      }
    }

    initializeAuth()
  }, [accessToken, user, login, logout, setUser, router, pathname])

  // 💡 Prevent any child rendering until decision is made
  if (!canRender) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <span className="text-muted-foreground animate-pulse">Loading auth...</span>
      </div>
    )
  }

  return <>{children}</>
}
