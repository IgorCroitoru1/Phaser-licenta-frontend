'use client'
import "@/styles/globals.css";
import { ServerSidebar } from '@/components/server/server-sidebar'
import { WithProvidersLayout } from '@/layouts/WithProvidersLayout'
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <WithProvidersLayout>
      <div className="flex h-screen">
        {/* <div className="w-60 bg-gray-800 text-white"> */}
        <SidebarProvider>

              <AppSidebar/>
              <div className="flex-1 relative">
              {children}
            </div>
        </SidebarProvider>

          {/* <ServerSidebar /> */}
        {/* </div> */}
       
      </div>
    </WithProvidersLayout>
  )
}
