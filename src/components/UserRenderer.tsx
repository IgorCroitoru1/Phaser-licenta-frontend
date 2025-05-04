'use client'

import { useTracks, TrackRefContext } from '@livekit/components-react'
import { useMemo } from 'react'
import { Track } from 'livekit-client'
import { useChannelStore } from '@/store/useChannelStore'
import { ChannelUser } from '@/user/ChannelUser'
import User from './User'
import { useAuthStore } from '@/store/useAuthStore'

export const UserRenderer = () => {
  const users = useChannelStore((state) => state.users)
  const userZones = useChannelStore(state => state.userZones);
  const user = useAuthStore(state => state.user);
  // All mic + cam tracks
  const tracks = useTracks([
    { source: Track.Source.Camera },
    { source: Track.Source.Microphone },
  ])
  console.log("Tracks length", tracks.length)
  const filteredTracks = useMemo(() =>
    tracks.filter((track) => {
      const id = track.participant.identity;
      const zone = userZones.get(id);
      return zone === userZones.get(user?.id ?? '');
    }),
  [tracks, userZones]);
  
  
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {Array.from(users.values()).map((user) => {
        const trackRef = filteredTracks.find(
          (t) => t.participant.identity === user.id
        ) || null

        return trackRef ? (
          <TrackRefContext.Provider key={user.id} value={trackRef}>
            <User user={user} trackRef={trackRef} />
          </TrackRefContext.Provider>
        ) : (
          <User key={user.id} user={user} trackRef={null} />
        )
      })}
    </div>
  )
// Removed the custom useMemo function as it conflicts with React's useMemo.
}

