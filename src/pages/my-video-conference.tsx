'use client';

import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
  usePersistentUserChoices,
} from '@livekit/components-react';
import { Room, Track } from 'livekit-client';
import '@livekit/components-styles';
import { useEffect, useState } from 'react';
import { LIVEKIT_URL, TEMP_TOKEN } from '../../config';

export default function Page() {
    const {
        saveAudioInputEnabled,
        saveVideoInputEnabled,
        saveAudioInputDeviceId,
        saveVideoInputDeviceId,
    } = usePersistentUserChoices();
    // TODO: get user input for room and name
    const serverUrl = LIVEKIT_URL;
    const token = TEMP_TOKEN;
    const room = 'quickstart-room';
    const name = 'quickstart-user';
    const [roomInstance] = useState(() => new Room({
        // Optimize video quality for each participant's scree
        adaptiveStream: true,
        // Enable automatic audio/video quality optimization
        dynacast: true,
    }));

    const handleSaveVideoInput = () => {
        roomInstance.localParticipant.setCameraEnabled(true);
        
        console.log('Video input enabled saved!');
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!mounted) return;
                await roomInstance.connect(serverUrl, token);
            } catch (e) {
                console.error(e);
            }
        })();
        roomInstance.on("localTrackUnpublished", (track) => {
            console.log("Track unpublished:", track);
        })
        return () => {
            mounted = false;
            roomInstance.disconnect();
        };
    }, [roomInstance]);

    return (
        <RoomContext.Provider value={roomInstance}>
            <div data-lk-theme="default" style={{ height: '100dvh' }}>
                {/* Your custom component with basic video conferencing functionality. */}
                <MyVideoConference />
                {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
                {/* <RoomAudioRenderer /> */}
                {/* Controls for the user to start/stop audio, video, and screen share tracks */}
                <ControlBar saveUserChoices={true} />
              
            </div>
            <button onClick={handleSaveVideoInput} style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                    Save Video Input
                </button>
        </RoomContext.Provider>
    );
}

function MyVideoConference() {
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