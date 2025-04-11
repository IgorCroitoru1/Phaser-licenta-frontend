import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { TrackPublication, RemoteTrack, Track } from "livekit-client";
import { User } from "../types/User";

export type Channel = {
    id: string;
    name: string;
    sceneName?: string;
    mapName: string
    colyseusRoomName: string
}

type ChannelState = {
    users: Map<string, User>;

    addUser: (user: User) => void;
    removeUser: (id: string) => void;
    updateUser: (id: string, update: Partial<User>) => void;
    updateStream: (userId: string, track: TrackPublication | RemoteTrack) => void;
    activeChannel: Channel | null;
    setActiveChannel: (channel: Channel) => void;
};

export const useChannelStore = create<ChannelState>()(
    immer((set) => ({
        users: new Map(),
        activeChannel: null,
        setActiveChannel: (channel) => set({ activeChannel: channel }),
        addUser: (user) => {
            set((state) => {
                state.users.set(user.id, user);
            });
        },

        removeUser: (id) => {
            set((state) => {
                state.users.delete(id);
            });
        },

        updateStream: (userId, track) => {
            if (track.kind === "video" || track.kind === "audio") {
                //const mediaStream = new MediaStream([track.]);
                set((state) => {
                    const user = state.users.get(userId);
                    if (user) {
                        user.videoStream = null; // ✅ Store stream inside user
                    }
                });
            }
        },
        updateUser(id, update) {
            set((state) => {
                const user = state.users.get(id);
                if (user) {
                    Object.assign(user, update);
                }
            });
        },
       
    }))
);
