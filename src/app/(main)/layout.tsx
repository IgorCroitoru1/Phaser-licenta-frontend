'use client'
import "@/styles/globals.css";
import { WithProvidersLayout } from '@/layouts/WithProvidersLayout'
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {  SocketProvider} from "@/context/WebSocketContext";
import { LiveKitProvider } from "@/components/LiveKit";
import { DeviceSelectionProvider } from "@/context/DeviceSelectionContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
     <DeviceSelectionProvider>
        <SocketProvider>
          <LiveKitProvider>
      <div className="flex h-screen">
        {/* <div className="w-60 bg-gray-800 text-white"> */}
        <SidebarProvider>              
          <AppSidebar/>
              <main className="flex-1">
                {children}
              </main>
        </SidebarProvider>

          {/* <ServerSidebar /> */}
        {/* </div> */}
       
      </div>
          </LiveKitProvider>

        </SocketProvider>
     </DeviceSelectionProvider>
  )
}
