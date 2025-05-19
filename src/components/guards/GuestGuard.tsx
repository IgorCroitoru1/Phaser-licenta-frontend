"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const { accessToken, isAuthLoading } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isAuthLoading && accessToken) {
      const redirectTo = searchParams?.get("from") || "/"
      router.replace(redirectTo)
    }
  }, [accessToken, isAuthLoading, router])

//   if (isAuthLoading) {
//     return (
//       <div className="w-screen h-screen flex items-center justify-center">
//         <span className="text-muted-foreground animate-pulse">Loading...</span>
//       </div>
//     )
//   }

    if (accessToken) return null

  return <>{children}</>
}
// 'use client'

// import { useEffect } from 'react'
// import { useAuthStore } from '@/store/useAuthStore'
// import { useRouter } from 'next/navigation'

// export default function GuestGuard({ children }: { children: React.ReactNode }) {
//   const { accessToken, isAuthLoading } = useAuthStore()
//   const router = useRouter()

//   useEffect(() => {
//     if (!isAuthLoading && accessToken) {
//       console.log("Access token found, redirecting to home page")
//       router.replace('/') // or use searchParams.get("from")
//     }
//   }, [accessToken, isAuthLoading, router])

//   if (isAuthLoading || accessToken) return null

//   return <>{children}</>
// }
