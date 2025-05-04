'use client'

// import { ChannelManager } from '@/components/ChannelManager'
import dynamic from 'next/dynamic'

// Lazy load App with SSR disabled for Phaser
// const AppWithoutSSR = dynamic(() => import('@/App'), { ssr: false })

const ChannelManager = dynamic(
    () => import('@/components/ChannelManager').then(mod => mod.ChannelManager),
    { ssr: false }
  );
export default function HomePage() {
  return <> 
          <ChannelManager />
          </>
}
