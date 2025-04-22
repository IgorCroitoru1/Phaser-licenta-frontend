import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { TrackPublication, RemoteTrack, Track, LocalVideoTrack, LocalAudioTrack } from "livekit-client";
import { User } from "../types/User";

export type Channel = {
    id: string;
    name: string;
    sceneName?: string;
    mapName: string
    colyseusRoomName: string
    livekitRoomName: string
}

type ChannelState = {
    users: Map<string, User>;

    addUser: (user: User) => void;
    removeUser: (id: string) => void;
    updateUser: (id: string, update: Partial<User>) => void;
    updateStream: (userId: string, track: TrackPublication | RemoteTrack) => void;
    activeChannel: Channel | null;
    setActiveChannel: (channel: Channel | null) => void;
    localVideoTrack: LocalVideoTrack | null;
    setLocalVideoTrack: (track: LocalVideoTrack | null) => void;
    setLocalAudioTrack: (track: LocalAudioTrack | null) => void;
    localAudioTrack: LocalAudioTrack | null;
    cameraId: string | null;
    microphoneId: string | null;
    setCameraId: (id: string) => void;
    setMicrophoneId: (id: string) => void;
    availableCameras: MediaDeviceInfo[];
    availableMicrophones: MediaDeviceInfo[];
    setAvailableCameras: (cameras: MediaDeviceInfo[]) => void;
    setAvailableMicrophones: (microphones: MediaDeviceInfo[]) => void;
    devicePermissionGranted: boolean;
    setDevicePermissionsGranted: (granted: boolean) => void;

    // isMuted: boolean;
    // setIsMuted: (muted: boolean) => void;
    // isCameraOn: boolean;
    // setIsCameraOn: (cameraOn: boolean) => void;
};

export const useChannelStore = create<ChannelState>()(
    immer((set) => ({
      users: new Map(),
      activeChannel: null,
      localVideoTrack: null,
      localAudioTrack: null,
      cameraId: null,
      microphoneId: null,
      availableCameras: [],
      availableMicrophones: [],
      devicePermissionGranted: false,
  
      setActiveChannel: (channel) => set({ activeChannel: channel }),
      addUser: (user) => set((state) => { state.users.set(user.id, user); }),
      removeUser: (id) => set((state) => { state.users.delete(id); }),
      updateUser: (id, update) => set((state) => {
        const user = state.users.get(id);
        if (user) Object.assign(user, update);
      }),
      updateStream: (userId, track) => {
        if (track.kind === "video" || track.kind === "audio") {
          set((state) => {
            const user = state.users.get(userId);
            if (user) user.videoStream = null; // You can adjust based on stream logic
          });
        }
      },
  
      setLocalVideoTrack: (track) => set({ localVideoTrack: track }),
      setLocalAudioTrack: (track) => set({ localAudioTrack: track }),
      setCameraId: (id) => set({ cameraId: id }),
      setMicrophoneId: (id) => set({ microphoneId: id }),
      setAvailableCameras: (cameras) => set({ availableCameras: cameras }),
      setAvailableMicrophones: (mics) => set({ availableMicrophones: mics }),
      setDevicePermissionsGranted: (granted) => set({ devicePermissionGranted: granted }),
    }))
  );
  