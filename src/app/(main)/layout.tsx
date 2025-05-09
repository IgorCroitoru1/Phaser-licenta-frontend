'use client'
import "@/styles/globals.css";
import { ServerSidebar } from '@/components/server/server-sidebar'
import { WithProvidersLayout } from '@/layouts/WithProvidersLayout'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <WithProvidersLayout>
      <div className="flex h-screen">
        <div className="w-60 bg-gray-800 text-white">
          <ServerSidebar />
        </div>
        <div className="flex-1 relative">
          {children}
        </div>
      </div>
    </WithProvidersLayout>
  )
}
