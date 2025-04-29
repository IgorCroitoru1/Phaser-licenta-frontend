import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Track, LocalVideoTrack, LocalAudioTrack, Participant, RemoteParticipant, LocalParticipant } from "livekit-client";
import { type, Schema } from "@colyseus/schema";
import { enableMapSet } from "immer";
import { ChannelUserDto } from "@/dtos/ChannelUserDto";
import { ChannelUser } from "@/user/ChannelUser";

// ==================== Types ====================
export type Channel = {
  id: string;
  name: string;
  sceneName?: string;
  mapName: string;
  colyseusRoomName: string;
  livekitRoomName: string;
};




// export class RemoteUser extends User {
//   //remoteParticipant: RemoteParticipant | null;
// }

// export class LocalUser extends User {
//   //localParticipant: LocalParticipant | null;
// }

type DeviceState = {
  // videoTrack: LocalVideoTrack | null;
  // audioTrack: LocalAudioTrack | null;
  cameraId: string | null;
  microphoneId: string | null;
  availableCameras: MediaDeviceInfo[];
  availableMicrophones: MediaDeviceInfo[];
  permissionsGranted: boolean;

  setCameraId: (id: string) => void;
  setMicrophoneId: (id: string) => void;
  setAvailableCameras: (cameras: MediaDeviceInfo[]) => void;
  setAvailableMicrophones: (mics: MediaDeviceInfo[]) => void;
  setPermissionsGranted: (granted: boolean) => void;
};

type GameState = {
  loaded: boolean;
  sceneLoaded: boolean;

  // camera: {
  //   zoom: number;
  //   worldX: number;
  //   worldY: number;
  // };
  
  // setCamera: (worldX: number, worldY: number,zoom: number) => void;
  //localUserId: string | null;
 // users: Map<string, User>;
};

type ChannelActions = {
  setActiveChannel: (channel: Channel | null) => void;
  switchScene: (map: string, room: string, scene?: string) => Promise<boolean>;
  setSwitchScene: (fn: ChannelActions['switchScene']) => void;
  clear: () => void;

  
  addUser: (user: ChannelUser) => void;
  removeUser: (id: string) => void;
  clearUsers: () => void;
  updateUser: (id: string, update: Partial<ChannelUser>) => void;
  updateUserPosition: (id: string, x: number, y: number) => void;
  updateAllPositions: (updates: Array<{ id: string; x: number; y: number }>) => void;
  // Device
  // setVideoTrack: (track: LocalVideoTrack | null) => void;
  // setAudioTrack: (track: LocalAudioTrack | null) => void;
  // setCameraId: (id: string) => void;
  // setMicrophoneId: (id: string) => void;
  // setAvailableCameras: (cameras: MediaDeviceInfo[]) => void;
  // setAvailableMicrophones: (mics: MediaDeviceInfo[]) => void;
  // setPermissionsGranted: (granted: boolean) => void;

  // Game
  setGameLoaded: (loaded: boolean) => void;
  setSceneLoaded: (loaded: boolean) => void;
};

export const useDeviceStore = create<DeviceState>()(
  immer((set) => ({
    // videoTrack: null,
    // audioTrack: null,
    cameraId: null,
    microphoneId: null,
    availableCameras: [],
    availableMicrophones: [],
    permissionsGranted: false,

    // setVideoTrack: (track) => set({ videoTrack: track }),
    // setAudioTrack: (track) => set({ audioTrack: track }),
    setCameraId: (id) => set({ cameraId: id }),
    setMicrophoneId: (id) => set({ microphoneId: id }),
    setAvailableCameras: (c) => set({ availableCameras: c }),
    setAvailableMicrophones: (m) => set({ availableMicrophones: m }),
    setPermissionsGranted: (g) => set({ permissionsGranted: g }),
    })  
))

type ChannelStore = {
  activeChannel: Channel | null;
  users: Map<string, ChannelUser>;
}  &
  GameState &
  ChannelActions;
enableMapSet();
export const useChannelStore = create<ChannelStore>()(
  immer((set) => ({
    activeChannel: null,
    users: new Map(),
    localUser: null,
    remoteUsers: new Map(),

    // videoTrack: null,
    // audioTrack: null,
    // cameraId: null,
    // microphoneId: null,
    // availableCameras: [],
    // availableMicrophones: [],
    // permissionsGranted: false,

    loaded: false,
    sceneLoaded: false,

    setActiveChannel: (channel) => set({ activeChannel: channel }),
    switchScene: async () => false,
    setSwitchScene: (fn) => set({ switchScene: fn }),

    clear: () =>
      set((state) => {
        state.activeChannel = null;
        state.users.clear();
        // state.videoTrack = null;
        // state.audioTrack = null;
        // state.cameraId = null;
        // state.microphoneId = null;
        // state.availableCameras = [];
        // state.availableMicrophones = [];
        // state.permissionsGranted = false;
      }),
    addUser: (user) =>
      set((state) => {
        state.users.set(user.id, user);
      }),
    
    removeUser: (id) =>
      set((state) => {
        state.users.delete(id);
      }),
    
    clearUsers: () =>
      set((state) => {
        state.users.clear();
      }),
    
    updateUser: (id, update) =>
      set((state) => {
        const user = state.users.get(id);
        if (user) Object.assign(user, update);
      }),
    
    updateUserPosition: (id, x, y) =>
      set((state) => {
        const user = state.users.get(id);
        if (user) {
          user.x = x;
          user.y = y;
        }
      }),
    updateAllPositions: (updates) =>
      set((state) => {
        updates.forEach(({ id, x, y }) => {
          const user = state.users.get(id);
          if (user) {
            user.x = x;
            user.y = y;
          }
        });
      }),
    // setVideoTrack: (track) => set({ videoTrack: track }),
    // setAudioTrack: (track) => set({ audioTrack: track }),
    // setCameraId: (id) => set({ cameraId: id }),
    // setMicrophoneId: (id) => set({ microphoneId: id }),
    // setAvailableCameras: (c) => set({ availableCameras: c }),
    // setAvailableMicrophones: (m) => set({ availableMicrophones: m }),
    // setPermissionsGranted: (g) => set({ permissionsGranted: g }),

    setGameLoaded: (loaded) => set({ loaded }),
    setSceneLoaded: (sceneLoaded) => set({ sceneLoaded }),
    // setCamera: (worldX,worldY, zoom) =>
    //   set((state) => {
    //     state.camera.zoom = zoom;
    //     state.camera.worldX = worldX;
    //     state.camera.worldY = worldY;
    //   }),
  }))
);

export const userPositionSelector = (userId: string) => (state: ChannelStore) => {
  const player = state.users.get(userId);
  return [player?.x ?? 0, player?.y ?? 0] as const;
};


// export const useDeviceState = () => 
//   useChannelStore((state) => ({
//     // videoTrack: state.videoTrack,
//     // audioTrack: state.audioTrack,
//     cameraId: state.cameraId,
//     microphoneId: state.microphoneId,
//     permissionsGranted: state.permissionsGranted,
//     // setVideoTrack: state.setVideoTrack,
//     // setAudioTrack: state.setAudioTrack,
//   }));

