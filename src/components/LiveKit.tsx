'use client';
import { ControlBar as CustomControlBar } from './liivekit/ControlBar';
import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
  usePersistentUserChoices,
  TrackLoop,
  VideoTrack
} from '@livekit/components-react';
import { createLocalAudioTrack,createLocalVideoTrack, Room, Track } from 'livekit-client';
import '@livekit/components-styles';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { LIVEKIT_URL, TEMP_TOKEN } from '../../config';
import { useDeviceSelection } from '@/context/DeviceSelectionContext';
import CameraAccessPage from '@/pages/camera-access';
import { useChannelStore, useDeviceStore } from '@/store/useChannelStore';
import PlayerVideo from './ui/Player2';
import api from '@/lib/axios';
import { useSocket } from '@/context/WebSocketContext';
const serverUrl = LIVEKIT_URL;
const token = TEMP_TOKEN;
export const LiveKitProvider = ({ children }: PropsWithChildren) => {
  const [roomInstance] = useState(() => new Room({ adaptiveStream: true, dynacast: true }));
  const { permissionsGranted, cameraId, microphoneId } = useDeviceStore();
  const { currentChannel, channelLiveKitToken, requestLiveKitToken } = useSocket();
  
  // Track current connection state
  const connectionQueueRef = useRef<Promise<void> | null>(null);
  const isUnmountingRef = useRef(false);

  // Add connection timeout and retry logic
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxConnectionAttempts = 3;
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear connection timeout
  const clearConnectionTimeout = () => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  };

  // Add connection state for UI feedback
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  console.log('🔗 Initializing LiveKit room...');
  // Debug logging for state changes
  useEffect(() => {
    console.log(channelLiveKitToken ? '🔗 LiveKit token available' : '🔗 No LiveKit token');
    console.log('🔍 LiveKit state update:', {
      currentChannel,
      hasToken: !!channelLiveKitToken,
      tokenChannelId: channelLiveKitToken?.channelId,
      roomState: roomInstance.state,
      tokensMatch: channelLiveKitToken?.channelId === currentChannel
    });
  }, [currentChannel, channelLiveKitToken, roomInstance.state]);  useEffect(() => {
    // Only connect when we have both currentChannel and matching LiveKit token
    if (!currentChannel || !channelLiveKitToken || channelLiveKitToken.channelId !== currentChannel) {
      console.log('🔍 Waiting for channel and token...', { 
        currentChannel, 
        tokenChannelId: channelLiveKitToken?.channelId 
      });
      // Reset connection attempts when conditions aren't met
      setConnectionAttempts(0);
      clearConnectionTimeout();
      return;
    }

    isUnmountingRef.current = false;
    const connectWithCleanup = async () => {
      try {
        // 1. First disconnect from any existing room
        if (roomInstance.state === 'connected') {
          console.log('🚪 Disconnecting from previous room...');
          await roomInstance.disconnect();
        }

        // 2. Check if we got unmounted while disconnecting
        if (isUnmountingRef.current) return;        // 3. Connect to new room using the received LiveKit token
        console.log('🔗 Connecting to LiveKit room...', { 
          channelId: currentChannel, 
          hasToken: !!channelLiveKitToken.token,
          attempt: connectionAttempts + 1
        });
        
        setIsConnecting(true); // Set connecting state
        setConnectionError(null); // Clear previous errors

        // Set connection timeout
        const timeoutPromise = new Promise((_, reject) => {
          connectionTimeoutRef.current = setTimeout(() => {
            reject(new Error('Connection timeout'));
          }, 15000); // 15 second timeout
        });

        // Race between connection and timeout
        await Promise.race([
          roomInstance.connect(LIVEKIT_URL, channelLiveKitToken.token, {
            autoSubscribe: true,
          }),
          timeoutPromise
        ]);

        clearConnectionTimeout();
        setConnectionAttempts(0); // Reset attempts on success
        setIsConnecting(false); // Reset connecting state
        console.log('✅ LiveKit room connection complete');
        
      } catch (err) {
        clearConnectionTimeout();
        setIsConnecting(false); // Reset connecting state
          if (!isUnmountingRef.current) {
          console.error('❌ LiveKit connection failed:', err);
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setConnectionError(errorMessage); // Set connection error
          
          // Retry logic
          const currentAttempt = connectionAttempts + 1;
          if (currentAttempt < maxConnectionAttempts) {
            console.log(`🔄 Retrying connection... (${currentAttempt}/${maxConnectionAttempts})`);
            setConnectionAttempts(currentAttempt);
            
            // Retry after delay
            setTimeout(() => {
              if (!isUnmountingRef.current && currentChannel && channelLiveKitToken) {
                console.log('🔄 Executing retry...');
                connectWithCleanup();
              }
            }, 2000 * currentAttempt); // Exponential backoff
          } else {
            console.error('❌ Max connection attempts reached');
            setConnectionAttempts(0);
          }
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
      clearConnectionTimeout();
      
      // Wait for current connection process to finish before cleanup
      const cleanup = async () => {
        try {
          if (connectionQueueRef.current) {
            await connectionQueueRef.current;
          }

          // Disconnect when component unmounts or channel changes
          if (roomInstance.state === 'connected') {
            console.log('🧹 Cleaning up LiveKit connection...');
            await roomInstance.disconnect();
          }
        } catch (err) {
          console.warn('LiveKit cleanup warning:', err);
        }
      };

      cleanup();
    };
  }, [currentChannel, channelLiveKitToken, connectionAttempts]);
  // Add room event listeners for better monitoring
  useEffect(() => {
    const room = roomInstance;

    const handleRoomConnected = () => {
      console.log('✅ LiveKit room connected successfully');
    };

    const handleRoomDisconnected = (reason?: any) => {
      console.log('❌ LiveKit room disconnected:', reason);
    };

    const handleRoomReconnecting = () => {
      console.log('🔄 LiveKit room reconnecting...');
    };

    const handleRoomReconnected = () => {
      console.log('🔄 LiveKit room reconnected');
    };

    const handleParticipantConnected = (participant: any) => {
      console.log('👤 Participant connected:', participant.identity);
    };

    const handleParticipantDisconnected = (participant: any) => {
      console.log('👤 Participant disconnected:', participant.identity);
    };

    // Add event listeners
    room.on('connected', handleRoomConnected);
    room.on('disconnected', handleRoomDisconnected);
    room.on('reconnecting', handleRoomReconnecting);
    room.on('reconnected', handleRoomReconnected);
    room.on('participantConnected', handleParticipantConnected);
    room.on('participantDisconnected', handleParticipantDisconnected);

    return () => {
      // Clean up event listeners
      room.off('connected', handleRoomConnected);
      room.off('disconnected', handleRoomDisconnected);
      room.off('reconnecting', handleRoomReconnecting);
      room.off('reconnected', handleRoomReconnected);
      room.off('participantConnected', handleParticipantConnected);
      room.off('participantDisconnected', handleParticipantDisconnected);
    };
  }, [roomInstance]);  // Request LiveKit token when channel changes but no token is available
  // useEffect(() => {
  //   if (currentChannel && !channelLiveKitToken) {
  //     console.log('🎫 Requesting LiveKit token for channel:', currentChannel);
      
  //     requestLiveKitToken(currentChannel)
  //       .then((response) => {
  //         console.log('✅ LiveKit token received:', response);
  //       })
  //       .catch((error) => {
  //         console.error('❌ Failed to get LiveKit token:', error);
  //       });
  //   }
  // }, [currentChannel, channelLiveKitToken, requestLiveKitToken]);

   if (!permissionsGranted || !cameraId || !microphoneId) return <CameraAccessPage />;

  return (
    <RoomContext.Provider value={roomInstance}>
       
      {children}
    </RoomContext.Provider>
  );
};

// export const getLivekitToken = async (room: string): Promise<string> => {
//   const res = await api.get<{token: string}>(`/livekit/token?room=${room}`);
//   return res.data.token;
// };

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

    <>
      {tracks.map((trackRef) => (
        <VideoTrack
          trackRef={trackRef}
          style={{
            width: '160px',
            height: '120px',
            overflow: 'hidden',
            borderRadius: '12px',
            background: 'black',
          }}
          key={trackRef.participant.identity}
        />
      ))}
      <TrackLoop tracks={tracks}>
        <ParticipantTile />
      </TrackLoop>
      <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
        {/* The GridLayout accepts zero or one child. The child is used
        as a template to render all passed in tracks. */}
        <ParticipantTile />
      </GridLayout>
    </>
  );
}

// Connection status component for UI feedback
export const LiveKitConnectionStatus = () => {
  const { currentChannel, channelLiveKitToken } = useSocket();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // You can expose these states through a context or props if needed
  const hasRequiredData = currentChannel && channelLiveKitToken && 
    channelLiveKitToken.channelId === currentChannel;

  if (!currentChannel) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        No channel selected
      </div>
    );
  }

  if (!hasRequiredData) {
    return (
      <div className="flex items-center gap-2 text-sm text-yellow-600">
        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
        Preparing video connection...
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
        Connecting to video...
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <div className="w-2 h-2 rounded-full bg-red-400"></div>
        Connection failed: {connectionError}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600">
      <div className="w-2 h-2 rounded-full bg-green-400"></div>
      Video connected
    </div>
  );
};