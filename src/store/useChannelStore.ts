import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Track, LocalVideoTrack, LocalAudioTrack, Participant, RemoteParticipant, LocalParticipant } from "livekit-client";
import { type, Schema } from "@colyseus/schema";
import { enableMapSet } from "immer";
import { ChannelUserDto } from "@/dtos/ChannelUserDto";
import { ChannelUser } from "@/user/ChannelUser";
import { use } from "matter";

// ==================== Types ====================
export type Channel = {
  id: string;
  name: string;
  mapName: string;
  maxUsers: number;
  isActive: boolean;
  createdBy: string;
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

  userZones: Map<string, number>;
  zoneStates: Map<number, boolean>;
  nearbyUsers: Set<string>;
  debugNearbyUsers: Map<string, Set<string>>;
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
  switchChannel: (channel: Channel) => Promise<boolean>;
  setSwitchCannel: (fn: ChannelActions['switchChannel']) => void;
  updateActiveChannel: (updates: Partial<Channel>) => void;
  refreshChannelsList: () => Promise<void>;
  setRefreshChannelsList: (fn: () => Promise<void>) => void;
  clear: () => void;

  
  addUser: (user: ChannelUser) => void;
  removeUser: (id: string) => ChannelUserDto | undefined;
  clearUsers: () => void;
  updateUser: (id: string, update: Partial<ChannelUser>) => void;
  getUser: (id: string) => ChannelUser | undefined;
  // updateUserPosition: (id: string, x: number, y: number) => void;
  // updateAllPositions: (updates: Array<{ id: string; x: number; y: number }>) => void;

  updateUserZone: (userId: string, zoneId: number) => void;
  setZoneState: (zoneId: number, isOpen: boolean) => void;
  setNearbyUser: (userId: string) => void;
  updateNearbyUsers: (userIds: string[]) => void;
  removeNearbyUser: (userId: string) => void;
  clearNearbyUsers: () => void;

  setDebugNearbyUsers: (userId: string, nearbyUsers: string[]) => void;
  removeDebugNearbyUser: (userId: string) => void;
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
  immer((set, get) => ({
    activeChannel: null,
    users: new Map(),
    localUser: null,
    remoteUsers: new Map(),
    userZones: new Map(),
    zoneStates: new Map(),
    nearbyUsers: new Set<string>(),

    debugNearbyUsers: new Map(),
    // videoTrack: null,
    // audioTrack: null,
    // cameraId: null,
    // microphoneId: null,
    // availableCameras: [],
    // availableMicrophones: [],
    // permissionsGranted: false,

    loaded: false,
    sceneLoaded: false,

    setDebugNearbyUsers: (userId: string, nearbyUsers: string[]) => set((state) => {
      const updated = new Map(state.debugNearbyUsers); // Copy existing map
      updated.set(userId, new Set(nearbyUsers));       // Update or insert user's nearby set
      return { debugNearbyUsers: updated };
    }),

    removeDebugNearbyUser: (userId: string) => set((state) => {
      const updated = new Map(state.debugNearbyUsers); // Copy existing map
      updated.delete(userId);                          // Remove the entry
      return { debugNearbyUsers: updated };
    }),
    
    updateNearbyUsers: (userIds) => set((state) => {
      state.nearbyUsers = new Set(userIds);
      
    }),
    setNearbyUser: (userId) => set((state) => {
      state.nearbyUsers.add(userId);
    }),
    removeNearbyUser: (userId) => set((state) => {
      state.nearbyUsers.delete(userId);
    }),
    clearNearbyUsers: () => set((state) => {
      state.nearbyUsers.clear();    }),
    setActiveChannel: (channel) => set({ activeChannel: channel }),    updateActiveChannel: (updates) =>
      set((state) => {
        if (state.activeChannel) {
          state.activeChannel = { ...state.activeChannel, ...updates };
        }
      }),
    refreshChannelsList: async () => {},
    setRefreshChannelsList: (fn) => set({ refreshChannelsList: fn }),
    switchChannel: async () => false,
    setZoneState: (zoneId, isOpen) =>
      set((state) => {
        const updated = new Map(state.zoneStates);
        updated.set(zoneId, isOpen);
        return { zoneStates: updated };
      }),
    setSwitchCannel: (fn) => set({ switchChannel: fn }),
    updateUserZone: (userId, zoneId) => set((state) => {
      const newMap = new Map(state.userZones);
      newMap.set(userId, zoneId);
      return { userZones: newMap };
    }),
    clear: () =>
      set((state) => {
        state.activeChannel = null;
        // state.loaded = false;
        state.sceneLoaded = false;
        state.users.clear();
        state.userZones.clear();
        state.zoneStates.clear();
        state.nearbyUsers.clear();
        // state.videoTrack = null
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
          
      removeUser: (id) => {
        const deletedUser = get().users.get(id);
        set((state) => {
          state.users.delete(id);
        });
        return deletedUser;
      },
         getUser: (id) =>
          get().users.get(id),

          clearUsers: () =>
            set((state) => {
        state.users.clear();
      }),
    
    updateUser: (id, update) =>
      set((state) => {
        const user = state.users.get(id);
        if (user) Object.assign(user, update);
      }),
    
    // updateUserPosition: (id, x, y) =>
    //   set((state) => {
    //     const user = state.users.get(id);
    //     if (user) {
    //       user.x = x;
    //       user.y = y;
    //     }
    //   }),
    // updateAllPositions: (updates) =>
    //   set((state) => {
    //     updates.forEach(({ id, x, y }) => {
    //       const user = state.users.get(id);
    //       if (user) {
    //         user.x = x;
    //         user.y = y;
    //       }
    //     });
    //   }),
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

// export const userPositionSelector = (userId: string) => (state: ChannelStore) => {
//   const player = state.users.get(userId);
//   return [player?.x ?? 0, player?.y ?? 0] as const;
// };


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

