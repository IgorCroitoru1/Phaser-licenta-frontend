'use client';
import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
} from '@livekit/components-react';
import { createLocalAudioTrack,createLocalVideoTrack, Room, Track } from 'livekit-client';
import '@livekit/components-styles';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { LIVEKIT_URL, TEMP_TOKEN } from '../../config';
import { useDeviceSelection } from '@/context/DeviceSelectionContext';
import CameraAccessPage from '@/pages/camera-access';
import { useChannelStore } from '@/store/useChannelStore';
const serverUrl = LIVEKIT_URL;
const token = TEMP_TOKEN;
export const LiveKitProvider = ({ children }: PropsWithChildren) => {
  const [roomInstance] = useState(() => new Room({ adaptiveStream: true, dynacast: true }));
  const { activeChannel, localAudioTrack, localVideoTrack, devicePermissionGranted, setLocalAudioTrack, setLocalVideoTrack } = useChannelStore();
  
  // Track current connection state
  const connectionQueueRef = useRef<Promise<void> | null>(null);
  const isUnmountingRef = useRef(false);

  useEffect(() => {
    if (!devicePermissionGranted || !activeChannel) return;

    isUnmountingRef.current = false;
    
    const connectWithCleanup = async () => {
      try {
        // 1. First disconnect from any existing room
        if (roomInstance.state === 'connected') {
          console.log('🚪 Disconnecting from previous room...');
          if (localAudioTrack) {
            const newLocalAudioTrack = await roomInstance.localParticipant?.unpublishTrack(localAudioTrack);
            setLocalAudioTrack(newLocalAudioTrack? localAudioTrack : null);
          }
          if (localVideoTrack) {
            const newLocalVideoTrack= await roomInstance.localParticipant?.unpublishTrack(localVideoTrack);
            setLocalVideoTrack(newLocalVideoTrack? localVideoTrack : null);
          }
          await roomInstance.disconnect();
        }

        // 2. Check if we got unmounted while disconnecting
        if (isUnmountingRef.current) return;

        // 3. Connect to new room
        console.log('🔗 Connecting to new room...');
        await roomInstance.connect(LIVEKIT_URL, TEMP_TOKEN);

        // 4. Publish tracks
        if (localAudioTrack) {
          console.log('🔊 Publishing audio...');
          await roomInstance.localParticipant.publishTrack(localAudioTrack);
        }

        if (localVideoTrack) {
          console.log('🎥 Publishing video...');
          await roomInstance.localParticipant.publishTrack(localVideoTrack);
        }

        console.log('✅ Room connection complete');
      } catch (err) {
        if (!isUnmountingRef.current) {
          console.error('❌ Connection process failed:', err);
        }
      }
    };

    // Queue the connection process
    connectionQueueRef.current = connectWithCleanup()
      .finally(() => {
        connectionQueueRef.current = null;
      });

    return () => {
      isUnmountingRef.current = true;
      
      // Wait for current connection process to finish before cleanup
      const cleanup = async () => {
        try {
          if (connectionQueueRef.current) {
            await connectionQueueRef.current;
          }

          // Only cleanup if we're actually unmounting (not channel switching)
          if (!devicePermissionGranted || !activeChannel) {
            console.log('🧹 Performing full cleanup...');
            if (localAudioTrack) {
              const newLocalAudioTrack = await roomInstance.localParticipant?.unpublishTrack(localAudioTrack);
              setLocalAudioTrack(newLocalAudioTrack? localAudioTrack : null);
            }
            if (localVideoTrack) {
              const newLocalVideoTrack= await roomInstance.localParticipant?.unpublishTrack(localVideoTrack);
              setLocalVideoTrack(newLocalVideoTrack? localVideoTrack : null);
            }
            await roomInstance.disconnect();
          }
        } catch (err) {
          console.warn('Cleanup warning:', err);
        }
      };

      cleanup();
    };
  }, [devicePermissionGranted, activeChannel]);

  if (!devicePermissionGranted) return <CameraAccessPage />;

  return (
    <RoomContext.Provider value={roomInstance}>
      <ControlBar/>
      {children}
    </RoomContext.Provider>
  );
};

export function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  
  return (
    <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
      {/* The GridLayout accepts zero or one child. The child is used
      as a template to render all passed in tracks. */}
      <ParticipantTile />
    </GridLayout>
  );
}