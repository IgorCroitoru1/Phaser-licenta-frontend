'use client'
import { ControlBar } from '../../components/liivekit/ControlBar'
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
        <div className="relative h-full w-full overflow-hidden">
          <ChannelManager />
          <div className="flex absolute left-0 right-0 bottom-4 px-4 justify-center z-101">
          <div className="bg-white rounded-md shadow p-2" data-lk-theme="my-theme">
            <ControlBar/>
        </div>
          </div>
       
        </div>
          </>
}
