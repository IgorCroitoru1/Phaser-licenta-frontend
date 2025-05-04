'use client';
import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import { VideoTrack, TrackReferenceOrPlaceholder, useIsSpeaking, useEnsureTrackRef, AudioTrack, ParticipantTile } from '@livekit/components-react';
import GameConfig from '../../game-config';
import { ChannelUser } from '@/user/ChannelUser';
import { useChannelStore, userPositionSelector } from '@/store/useChannelStore';
import { useState } from 'react';
import { shallow } from 'zustand/shallow';
import { userRefsManager } from '@/user/UserRefsManager';
interface UserProps {
  trackRef: TrackReferenceOrPlaceholder | null;
  user: ChannelUser;
}
function useSafeEnsureTrackRef(trackRef: TrackReferenceOrPlaceholder | null) {
  try {
    return trackRef ? useEnsureTrackRef(trackRef) : null;
  } catch (error) {
    console.warn('Failed to ensure track reference:', error);
    return null;
  }
}
const User = forwardRef<HTMLDivElement, UserProps>(({ trackRef, user }, externalRef) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = externalRef ?? internalRef;
  const isSpeaking = trackRef ? useIsSpeaking(trackRef.participant) : false;
  const [translate, setTranslate] = useState('');
  // const camera = useChannelStore(state => state.camera);
  // const player = useChannelStore((state) => state.users.get(user.id));
  const userId = user.id;
  //if (!player) return null;
  console.log("User component", userId, user.x, user.y);
  // Convert game world coordinates to screen space
 // const screenX = (player.x - camera.x) * camera.zoom + window.innerWidth / 2;
  //const screenY = (player.y - camera.y) * camera.zoom + window.innerHeight / 2;
  // const screenX = (player.x - camera.worldX) * camera.zoom;
  // const screenY = (player.y - camera.worldY) * camera.zoom;
  // const scaledWidth = GameConfig.playerWidth * camera.zoom;
  // const scaledHeight = GameConfig.playerHeight * camera.zoom;
 // console.log('User position:', player.x, player.y, 'Screen position:', screenX, screenY);
  useLayoutEffect(() => {
    const {zoom, worldX: cameraWorldX, worldY: cameraWorldY} = userRefsManager.camera
    const screenX = (user.x - cameraWorldX) * zoom
    const screenY = (user.y - cameraWorldY) * zoom
    console.log(screenX, screenY, "User screen coords")
    setTranslate(`translate(${screenX}px, ${screenY}px) scale(${zoom})`);
  }, []);

  useEffect(() => {
    if (!ref || typeof ref === 'function' || !('current' in ref) || !ref.current) return;
    userRefsManager.register(userId, ref.current, user.x, user.y);

    return () => {
      userRefsManager.unregister(userId);
    };
  }, [userId, ref]);
  const isVideoActive =
    trackRef &&
    trackRef.publication?.kind === "video" &&
    trackRef.publication?.isSubscribed &&
    trackRef.publication?.track;
  return (
    <div
      ref={ref}
      id={user.id}
      className="absolute rounded-2xl bg-white shadow-lg z-100 -translate-x-1/2 -translate-y-1/2"
      style={{
        transform: translate,
        //  transform: `translate(${screenX}px, ${screenY}px)`,
        width: `${GameConfig.playerWidth}px`,
        height: `${GameConfig.playerHeight}px`,
        // transformOrigin: 'center center',
        // top:0,
        // left:0,
      }}
    >
      {/* Video or Avatar Container */}
      {/* <ParticipantTile></ParticipantTile> */}
      <div className={`relative w-full h-full rounded-2xl overflow-hidden ${isSpeaking ? 'ring ring-green-400' : ''}`}>
        {isVideoActive ? (
          <VideoTrack
            trackRef={trackRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />
        ) : user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-500">
            {user.name}
          </div>
        )}
        {/* <AudioTrack></AudioTrack> */}
      </div>

      {/* Name Badge */}
      <div
        className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-black text-white text-[8px] px-2 py-1 rounded-2xl 
        w-[60px] overflow-hidden whitespace-nowrap text-ellipsis text-center"
        style={{ minWidth: `${GameConfig.playerWidth}px` }}
        title={user.name}
      >
        {user.name}
      </div>

      {/* Local Indicator */}
      {user.isLocal && (
        <div className="absolute top-1 left-1 w-2 h-2 bg-green-500 rounded-full"></div>
      )}
    </div>
  );
});

User.displayName = "User";
export default User;