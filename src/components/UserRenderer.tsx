import { useChannelStore } from "@/store/useChannelStore";
import { TrackReferenceOrPlaceholder, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useMemo } from "react";
import User from "./User";
import { ChannelUser } from "@/user/ChannelUser";

export const UserRenderer = () => {
    const  users  = useChannelStore(state => state.users)
    const cameraTracks = useTracks([{ source: Track.Source.Camera }]);
    // Combine users with their tracks
    const usersWithTracks: {
      user: ChannelUser,
      trackRef: TrackReferenceOrPlaceholder | null
    }[] = useMemo(() => {
      console.log("Users triggered")
      return Array.from(users.values())
        .map(user => ({
          user,
          trackRef: cameraTracks.find(t => t.participant.identity === user.id) || null
        }));
    }, [users, cameraTracks]);
    console.log(usersWithTracks, "usersWithTracks")
    return (
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        
        {/* Remote users */}
        {usersWithTracks.map(({ user, trackRef }) => (
          <User
            key={user.id}
            user={user}
            trackRef={trackRef}
          />
        ))}
      </div>
    );
  };