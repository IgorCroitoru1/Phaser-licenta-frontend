// layouts/WithProvidersLayout.tsx
import '@/styles/globals.css'

import { DeviceSelectionProvider } from "@/context/DeviceSelectionContext";
import { LiveKitProvider } from "@/components/LiveKit";

export function WithProvidersLayout({ children }: { children: React.ReactNode }) {
  return (
    <DeviceSelectionProvider>
      <LiveKitProvider>
        {children}
      </LiveKitProvider>
    </DeviceSelectionProvider>
  );
}