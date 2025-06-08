"use client";
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import {
    VideoTrack,
    TrackReferenceOrPlaceholder,
    useIsSpeaking,
    useEnsureTrackRef,
    AudioTrack,
    useMaybeTrackRefContext,
    useMaybeParticipantContext,
    useIsMuted,
} from "@livekit/components-react";
import GameConfig from "../../../game-config";
import { ChannelUser } from "@/user/ChannelUser";
import { useState } from "react";
import { shallow } from "zustand/shallow";
import { userRefsManager } from "@/user/UserRefsManager";
import React from "react";
import { Participant, Track } from "livekit-client";
import { Icons } from "../icons";
interface UserProps {
    // trackRef: TrackReferenceOrPlaceholder | null;
    user: ChannelUser;
    participant?: Participant; // Replace with the correct type for participant
}
function useSafeEnsureTrackRef(trackRef: TrackReferenceOrPlaceholder | null) {
    try {
        return trackRef ? useEnsureTrackRef(trackRef) : null;
    } catch (error) {
        console.warn("Failed to ensure track reference:", error);
        return null;
    }
}
const User = forwardRef<HTMLDivElement, UserProps>(
    ({ user, participant: prt }, externalRef) => {
        const internalRef = useRef<HTMLDivElement>(null);
        const ref = externalRef ?? internalRef;
        const trackRef = useMaybeTrackRefContext();
        const participant = useMaybeParticipantContext();
        const isSpeaking = useIsSpeaking(participant);
        const isMuted = useIsMuted(Track.Source.Camera);
        const isMicroMuted = useIsMuted(Track.Source.Microphone);
        // const isSpeaking = false;
        const [translate, setTranslate] = useState("");
        // const camera = useChannelStore(state => state.camera);
        // const player = useChannelStore((state) => state.users.get(user.id));
        const userId = user.id;
        //if (!player) return null;
        // if (isMuted) {
        //     console.log("User is muted", user.name);
        // }
        // Convert game world coordinates to screen space
        // const screenX = (player.x - camera.x) * camera.zoom + window.innerWidth / 2;
        //const screenY = (player.y - camera.y) * camera.zoom + window.innerHeight / 2;
        // const screenX = (player.x - camera.worldX) * camera.zoom;
        // const screenY = (player.y - camera.worldY) * camera.zoom;
        // const scaledWidth = GameConfig.playerWidth * camera.zoom;
        // const scaledHeight = GameConfig.playerHeight * camera.zoom;
        // console.log('User position:', player.x, player.y, 'Screen position:', screenX, screenY);
        useLayoutEffect(() => {
            const {
                zoom,
                worldX: cameraWorldX,
                worldY: cameraWorldY,
            } = userRefsManager.camera;
            // const screenX = (user.x - cameraWorldX) * zoom
            // const screenY = (user.y - cameraWorldY) * zoom
            console.log(screenX, screenY, "User screen coords");
            setTranslate(`translate(${0}px, ${0}px) scale(${zoom})`);
        }, []);

        useEffect(() => {
            if (
                !ref ||
                typeof ref === "function" ||
                !("current" in ref) ||
                !ref.current
            )
                return;
            userRefsManager.register(userId, ref.current, 0, 0);

            return () => {
                userRefsManager.unregister(userId);
            };
        }, [userId, ref]);
        const isVideoActive =
            trackRef &&
            trackRef.publication?.kind === "video" &&
            trackRef.publication?.isSubscribed &&
            trackRef.publication?.track &&
            !isMuted;
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
                <div
                    className={`relative w-full h-full rounded-2xl overflow-hidden ${
                        isSpeaking ? "ring-4 ring-green-400" : ""
                    }`}
                >
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
                inline-flex items-center justify-center gap-1 max-w-full overflow-hidden"
                    style={{ maxWidth: `${GameConfig.playerWidth}px` }}
                    title={user.name}
                >
                    <div className="truncate text-center">{user.name}</div>
                    {isMicroMuted && (
                        <Icons.micOff className="bg-red-500 rounded-full w-4 h-4 flex-shrink-0" />
                    )}
                </div>

                {/* Local Indicator */}
                {user.isLocal && (
                    <div className="absolute top-1 left-1 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
            </div>
        );
    }
);

User.displayName = "User";
export default User;
