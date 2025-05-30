'use client'

import { authService, AuthService } from '@/services/auth'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const authContext = useAuth()
  const {
    login,
    logout,
    setAuthLoading,
    accessToken,
    isAuthLoading,
    user,
    setUser,
  } = authContext

  const [canRender, setCanRender] = useState(false)

  const router = useRouter()
  const publicRoutes = ['/login', '/register']
  const pathname = usePathname()

  useEffect(() => {
    // Set the auth context in the service so it can update the context
    AuthService.setAuthContext(authContext)
  }, [authContext])

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
  }, [accessToken, user, login, logout, setUser, router, pathname, setAuthLoading])

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
