// components/AuthLoadingGate.tsx
"use client"

import { useAuth } from "@/context/AuthContext"


export default function AuthLoadingGate({ children }: { children: React.ReactNode }) {
  const { isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <span className="text-muted-foreground animate-pulse">Loading auth...</span>
      </div>
    )
  }

  return <>{children}</>
}
