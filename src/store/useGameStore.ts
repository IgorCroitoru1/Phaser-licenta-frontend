// import { MapSchema, Schema, type } from "@colyseus/schema";
// import { Room, Client, getStateCallbacks } from "colyseus.js";
// import { enableMapSet, produce } from "immer";
// import { create }  from "zustand";
// import { immer } from "zustand/middleware/immer";



// export class Player extends Schema {
//     @type("string") id: string;
//     @type("number") x: number;
//     @type("number") y: number;
// }

// type GameState = {
//     gameLoaded: boolean;
//     sceneLoaded: boolean;
//     setGameLoaded: (loaded: boolean) => void;   
//     setSceneLoaded: (loaded: boolean) => void;
//     localPlayerId: string | null; // ✅ Store the local player's ID
//     setLocalPlayerId: (id: string) => void;
//     players: Map<string, Player>;
//     addPlayer: (player: Player) => void;
//     updatePlayer: (id: string, x: number, y: number) => void;
//     removePlayer: (id: string) => void;

//     switchScene: (mapName: string, newRoomName: string, newSceneName?: string,) => Promise<boolean>;
//     setSwitchScene: (fn: (newScene: string, newRoomName: string) => Promise<boolean>) => void;
// };


// enableMapSet();
// export const useGameStore = create<GameState>()(
//     immer((set) => ({
//         players: new Map(),
//         localPlayerId: null,
//         gameLoaded: false,
//         sceneLoaded: false,

//         setLocalPlayerId: (id) =>
//             set(produce((state) => {
//                 state.localPlayerId = id;
//             })),

//         setGameLoaded: (loaded) =>
//             set(produce((state) => {
//                 state.gameLoaded = loaded;
//             })),

//         setSceneLoaded: (loaded) =>
//             set(produce((state) => {
//                 state.sceneLoaded = loaded;
//             })),

//         addPlayer: (player) =>
//             set(produce((state) => {
//                 state.players.set(player.id, player);
//             })),

//         updatePlayer: (id, x, y) =>
//             set(produce((state) => {
//                 const player = state.players.get(id);
//                 if (player) {
//                     player.x = x;
//                     player.y = y;
//                 }
//             })),

//         removePlayer: (id) =>
//             set(produce((state) => {
//                 state.players.delete(id);
//             })),
//             switchScene: async() => Promise.resolve(false), // Default empty function
//             setSwitchScene: (fn) => set({ switchScene: fn }),
//     }))
// );