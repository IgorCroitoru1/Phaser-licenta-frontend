'use client';
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
const serverUrl = LIVEKIT_URL;
const token = TEMP_TOKEN;
export const LiveKitProvider = ({ children }: PropsWithChildren) => {
  const [roomInstance] = useState(() => new Room({ adaptiveStream: true, dynacast: true }));
  const { permissionsGranted,cameraId , microphoneId} = useDeviceStore();
  const {activeChannel} = useChannelStore();
  // Track current connection state
  const connectionQueueRef = useRef<Promise<void> | null>(null);
  const isUnmountingRef = useRef(false);

  useEffect(() => {
    if (!activeChannel) return;

    isUnmountingRef.current = false;
    console.log('Local participant:', roomInstance.localParticipant)
    const connectWithCleanup = async () => {
      try {
        // 1. First disconnect from any existing room
        if (roomInstance.state === 'connected') {
          console.log('🚪 Disconnecting from previous room...');
          
           
          // if (localAudioTrack) {
          //   await roomInstance.localParticipant?.unpublishTrack(localAudioTrack);
          // }
          // if (localVideoTrack) {
          //   await roomInstance.localParticipant?.unpublishTrack(localVideoTrack);
          // }
          await roomInstance.disconnect();
        }

        // 2. Check if we got unmounted while disconnecting
        if (isUnmountingRef.current) return;

        // 3. Connect to new room
        console.log('🔗 Connecting to new room...');
        await roomInstance.connect(LIVEKIT_URL, TEMP_TOKEN, {
          
        });

        roomInstance.on("localTrackPublished", (track) => {
          console.log("Local track published", track);
        })
        roomInstance.on("localTrackSubscribed", (track) => {
          console.log("Local track subscribed", track);
        })
        roomInstance.on("activeDeviceChanged", (device, id) => {
          console.log("Active device changed", device, id);
        })
        roomInstance.localParticipant.on("trackMuted", (track) => {
          console.log("Local track muted", track);

        })
        roomInstance.localParticipant.on("trackUnmuted", (track) => {
          console.log("Local track unmuted", track);
        })
        // if(cameraId && cameraId !== "off"){
        //   const cameraTrack = await createLocalVideoTrack({ deviceId: cameraId });
        //   await roomInstance.localParticipant.publishTrack(cameraTrack);
        //   await roomInstance.localParticipant.setCameraEnabled(true);
        // }
        // if(microphoneId && microphoneId !== "off"){
        //   const audioTrack = await createLocalAudioTrack({ deviceId: microphoneId });
        //   await roomInstance.localParticipant.publishTrack(audioTrack);
        //   await roomInstance.localParticipant.setMicrophoneEnabled(true);
        // }

       
        // 4. Publish tracks
        // if (localAudioTrack) {
        //   console.log('🔊 Publishing audio...');
        //   await roomInstance.localParticipant.publishTrack(localAudioTrack);
        //   await roomInstance.localParticipant.setMicrophoneEnabled(true);
        // }

        // if (localVideoTrack) {
        //   console.log('🎥 Publishing video...');
        //   await roomInstance.localParticipant.publishTrack(localVideoTrack);
        //   await roomInstance.localParticipant.setCameraEnabled(true);
        // }

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
          if ( !activeChannel) {
            // console.log('🧹 Performing full cleanup...');
            // if (localAudioTrack) {
            //   const newLocalAudioTrack = await roomInstance.localParticipant?.unpublishTrack(localAudioTrack);
            //   setLocalAudioTrack(newLocalAudioTrack? localAudioTrack : null);
            // }
            // if (localVideoTrack) {
            //   const newLocalVideoTrack= await roomInstance.localParticipant?.unpublishTrack(localVideoTrack);
            //   setLocalVideoTrack(newLocalVideoTrack? localVideoTrack : null);
            // }

            await roomInstance.disconnect();
          }
        } catch (err) {
          console.warn('Cleanup warning:', err);
        }
      };

      cleanup();
    };
  }, [activeChannel]);

   if (!permissionsGranted || !cameraId || !microphoneId) return <CameraAccessPage />;

  return (
    <RoomContext.Provider value={roomInstance}>
       <div data-lk-theme="default">
      {/* <MyVideoConference/> */}
      <ControlBar/>
       </div>
      {children}
    </RoomContext.Provider>
  );
};

// export function MyVideoConference() {
//   // `useTracks` returns all camera and screen share tracks. If a user
//   // joins without a published camera track, a placeholder track is returned.
//   const tracks = useTracks(
//     [
//       { source: Track.Source.Camera, withPlaceholder: true },
//       { source: Track.Source.ScreenShare, withPlaceholder: false },
//     ],
//     { onlySubscribed: false },
//   );
 
//   return (

//     // tracks.map((trackRef) => (
//     //   <VideoTrack trackRef={trackRef}
//     //   style={{
//     //     width: '160px',
//     //     height: '120px',
//     //     overflow: 'hidden',
//     //     borderRadius: '12px',
//     //     background: 'black',
//     //   }}
//     //   key={trackRef.participant.identity}/>
//     //             // <ParticipantTile key={trackRef.participant.identity} trackRef={trackRef}/>
//     //           //  <PlayerVideo key={trackRef.participant.identity} trackRef={trackRef} />
//     //         ))
//     // <TrackLoop tracks={tracks}>
//     // <ParticipantTile/>
//     // </TrackLoop>
//     // <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
//     //   {/* The GridLayout accepts zero or one child. The child is used
//     //   as a template to render all passed in tracks. */}
//     //   <ParticipantTile />
//     // </GridLayout>
//   );
// }