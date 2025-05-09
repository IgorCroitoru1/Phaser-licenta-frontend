// layouts/WithProvidersLayout.tsx
import '@/styles/globals.css'

import { DeviceSelectionProvider } from "@/context/DeviceSelectionContext";
import { LiveKitProvider } from "@/components/LiveKit";

export function WithProvidersLayout({ children }: { children: React.ReactNode }) {
  console.log("WithProvidersLayout")
  return (
    <DeviceSelectionProvider>
      <LiveKitProvider>
        {children}
      </LiveKitProvider>
    </DeviceSelectionProvider>
  );
}