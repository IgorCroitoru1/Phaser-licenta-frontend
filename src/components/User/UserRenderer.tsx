'use client'

import { useTracks, TrackRefContext, useIsMuted, TrackReferenceOrPlaceholder, AudioTrack, useRoomContext, useParticipants, ParticipantLoop, ParticipantContext } from '@livekit/components-react'
import { useMemo } from 'react'
import { RoomEvent, Track } from 'livekit-client'
import { useChannelStore } from '@/store/useChannelStore'
import { ChannelUser } from '@/user/ChannelUser'
import User from './User'
import { useAuthStore } from '@/store/useAuthStore'

export const UserRenderer = () => {
  const users = useChannelStore((state) => state.users)
  const userZones = useChannelStore(state => state.userZones);
  const user = useAuthStore(state => state.user);
  const zoneStates = useChannelStore((s) => s.zoneStates)
  const participants = useParticipants()
  const nearbyUsers = useChannelStore((s) => s.nearbyUsers)
  const videoTracks = useTracks([{ source: Track.Source.Camera }],
    {
      updateOnlyOn: [
        RoomEvent.TrackPublished,
        RoomEvent.TrackSubscribed,
        RoomEvent.TrackUnsubscribed,
        RoomEvent.TrackUnpublished,
        RoomEvent.ParticipantConnected,
        RoomEvent.ParticipantDisconnected,
      ]
    }
  );
  const audioTracks = useTracks([{ source: Track.Source.Microphone }], {
    updateOnlyOn: [
      RoomEvent.TrackPublished,
      RoomEvent.TrackSubscribed,
      RoomEvent.TrackUnsubscribed,
      RoomEvent.TrackUnpublished,
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
    ]
  });
  const {filteredVideoTracks, filteredAudioTracks} = useMemo(() => {
    const currentUserId = user?.id ?? '';
    const currentUserZoneId = userZones.get(currentUserId) ?? -1; // Default to -1 if not found
    const isCurrentUserInClosedZone = currentUserZoneId !== -1 && 
                                     zoneStates.get(currentUserZoneId) === false;

    const videoFilterPredicate = (track: TrackReferenceOrPlaceholder) => {
      const trackUserId = track.participant.identity;
      const trackUserZoneId = userZones.get(trackUserId) ?? -1; // Default to -1 if not found
      // Always show yourself
      if (trackUserId === currentUserId) return true;

      // Case 1: Current user is in no zone (-1) or open zone - show all non-closed-zone users
      if (currentUserZoneId === -1 || !isCurrentUserInClosedZone) {
        // Show users who are either:
        // - In no zone (-1)
        // - In an open zone
        // - In the same zone as current user (if current user is in a zone)
        return trackUserZoneId === -1 || 
               zoneStates.get(trackUserZoneId) !== false ||
               trackUserZoneId === currentUserZoneId;
      }
      
      // Case 2: Current user is in closed zone - only show same zone users
      return trackUserZoneId === currentUserZoneId;
    };

    const audioFilterPredicate = (track: TrackReferenceOrPlaceholder) => {
      const trackUserId = track.participant.identity;
      const trackUserZoneId = userZones.get(trackUserId) ?? -1; // Default to -1 if not found
      // Always include your own audio
      // if (trackUserId === currentUserId) return true;
      if(nearbyUsers.has(trackUserId)) return true

      if(trackUserZoneId === -1) return false;

      return trackUserZoneId === currentUserZoneId;
    }
    return {
      filteredVideoTracks: videoTracks.filter(videoFilterPredicate),
      filteredAudioTracks: audioTracks.filter(audioFilterPredicate),
    }
  }, [nearbyUsers,videoTracks, audioTracks, userZones, zoneStates, user?.id]);

  // const userComponents = useMemo(() => {
  //   return participants.map((participant) => {
  //     // Find matching user in your Zustand store
  //     const user = users.get(participant.identity)
  //     if (!user) return null;

  //     const trackRef = filteredVideoTracks.find(
  //       (t) => t.participant.identity === participant.identity
  //     ) || null;

  //     return (
  //       <TrackRefContext.Provider key={participant.identity} value={trackRef}>
  //         <User 
  //           user={user} 
  //           participant={participant}
  //           // trackRef={trackRef} 
  //         />
  //       </TrackRefContext.Provider>
  //     );
  //   });
  // }, [participants, users, filteredVideoTracks]);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {participants.map((participant) => {
      // Find matching user in your Zustand store
      const user = users.get(participant.identity)
      if (!user) { 
        return null};
      const trackRef = filteredVideoTracks.find(
        (t) => t.participant.identity === participant.identity
      ) || null;
      
      return (
        <ParticipantContext.Provider key={participant.identity} value={participant}>

        <TrackRefContext.Provider key={participant.identity} value={trackRef}>
          <User 
            user={user} 
            // participant={participant}
            // trackRef={trackRef} 
          />
        </TrackRefContext.Provider>
      </ParticipantContext.Provider>

      );
    })}
      {/* {Array.from(users.values()).map((user) => {
        const trackRef = filteredVideoTracks.find(
          (t) => t.participant.identity === user.id
        ) || null

        return trackRef ? (
          <TrackRefContext.Provider key={user.id} value={trackRef}>
            <MemoizedUser key={user.id} user={user} trackRef={trackRef} />
          </TrackRefContext.Provider>
        ) : (
          <></>
          // <User key={user.id} user={user} trackRef={null} />
        )
      })} */}
      <AudioRenderer audioTracks={filteredAudioTracks} />
    </div>
  )
// Removed the custom useMemo function as it conflicts with React's useMemo.
}

// Separate component for audio rendering
const AudioRenderer = ({ audioTracks }: { audioTracks: TrackReferenceOrPlaceholder[] }) => {
  return (
    <>
      {audioTracks.map((track) => (
        <AudioTrack 
          key={`audio-${track.participant.identity}`}
          trackRef={track}
          // Additional audio-specific props
        />
      ))}
    </>
  );
};