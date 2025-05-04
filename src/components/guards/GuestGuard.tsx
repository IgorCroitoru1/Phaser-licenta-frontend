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
  }, [accessToken, isAuthLoading, router, searchParams])

//   if (isAuthLoading) {
//     return (
//       <div className="w-screen h-screen flex items-center justify-center">
//         <span className="text-muted-foreground animate-pulse">Loading...</span>
//       </div>
//     )
//   }

    if (accessToken) return <></>

  return <>{children}</>
}
