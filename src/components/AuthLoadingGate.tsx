// components/AuthLoadingGate.tsx
"use client"

import { useAuthStore } from "@/store/useAuthStore"


export default function AuthLoadingGate({ children }: { children: React.ReactNode }) {
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading)

  if (isAuthLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <span className="text-muted-foreground animate-pulse">Loading auth...</span>
      </div>
    )
  }

  return <>{children}</>
}
