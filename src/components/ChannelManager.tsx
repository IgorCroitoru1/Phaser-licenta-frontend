import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame"
import TestScene from "@/game/scenes/TestScene";
import { useGameStore } from "@/store/useGameStore";
import { Client, getStateCallbacks, Room } from "colyseus.js";
import { useRef, useState, useEffect, useCallback } from "react";
import GameConfig from "../../game-config";
import { MapSchema, Schema, type } from "@colyseus/schema";
import { Move } from "@/shared/event-data";
import { useColyseus } from "@/hooks/useColyseus";
import { join } from "path";
import { useChannelStore } from "@/store/useChannelStore";
import { MainMenu } from "@/game/scenes/MainMenu";
import { MyScene } from "@/game/scenes/MyScene";
import { GameEvents } from "@/game/common/common";
import { Position } from "@/game/common/types";
import { ColyseusEventPayloads } from "@/utils/colyseus-events";
import toast from "react-hot-toast";
import throttle from "lodash.throttle";
// const sceneRegistry = new Map<string, typeof Phaser.Scene>();
// sceneRegistry.set("TestScene", TestScene);
// sceneRegistry.set("MainMenu", MainMenu);
// sceneRegistry.set("MyScene", MyScene);
export class Player extends Schema {
    @type("string") id: string ;
    @type("number") x: number ;
    @type("number") y: number ;
    @type("number") currentZoneId: number = -1;
}

export class Zone extends Schema {
    @type("number") id: number;
    @type("boolean") isOpen: boolean;
    @type("string") lockedBy: string | null = null;
}

export class Door extends Schema {
    @type("number") id: number;
    @type("number") zoneId: number;
    @type("boolean") isOpen: boolean;
}
export class RoomState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
    @type({ map: Zone }) zones = new MapSchema<Zone>();
    @type({ map: Door }) doors = new MapSchema<Door>();
  }
export const ChannelManager = () => {
    const phaserRef = useRef<IRefPhaserGame>(null);
    const sceneLoaded = useGameStore((state) => state.sceneLoaded);
    const addPlayer = useGameStore((state) => state.addPlayer);
    const updatePlayer = useGameStore((state) => state.updatePlayer);
    const removePlayer = useGameStore((state) => state.removePlayer);
    const { room, isConnected, joinRoom, leaveRoom } = useColyseus();
    const setSwitchScene = useGameStore((state) => state.setSwitchScene);
    const switchScene = useCallback(async (newMapName: string, newRoomName: string): Promise<boolean> => {
        console.log("Switching scene");
    
        const game = phaserRef.current?.game;
        if (!game) return false;
    
        // Create new AbortController for this scene switch
        const abortController = new AbortController();
        //console.log("Leaving room")
        await leaveRoom()
           
    
        phaserRef.current?.scene?.scene?.remove();
        phaserRef.current?.game?.scene.add('MyScene', new MyScene())
    
        return new Promise(async (resolve) => {
            // Reject if aborted
            abortController.signal.addEventListener('abort', () => {
                resolve(false);
            });
    
            phaserRef.current?.game?.scene.start('MyScene', { cfg: {name: newMapName} });
            
            try {
                await joinRoom(newRoomName, {mapId: newMapName, token: GameConfig.TEMP_TOKEN});
            } catch (error) {
                if (!abortController.signal.aborted) {
                    console.error("Failed to join room:", error);
                }
                return resolve(false);
            }
    
            const unsubscribe = useGameStore.subscribe((state) => {
                if (abortController.signal.aborted) {
                    unsubscribe();
                    return;
                }
    
                if (state.sceneLoaded) {
                    unsubscribe();
                    resolve(true);
                }
            });
    
            // Cleanup on unmount or new scene switch
            return () => {
                abortController.abort();
                unsubscribe();
            };
        });
    }, [phaserRef, room, joinRoom, leaveRoom]);
    

    useEffect(() => {
        setSwitchScene(switchScene);
    }, [switchScene]);
    useEffect(() => {
        if (!sceneLoaded) return; // ✅ Wait for scene to load
       // if (!isConnected) joinRoom("game_room"); // ✅ Ensure room is joined only if not connected

    }, [sceneLoaded, isConnected]); // ✅ Dependencies ensure it runs correctly

    useEffect(() => {
        const scene = phaserRef.current?.scene as MyScene;
        if (!scene || !room) return;

        console.log("Scene loaded:", sceneLoaded);

        const $ = getStateCallbacks(room);

        // ✅ Handle new players
        $(room.state).players.onAdd((player, id) => {
            $(player).onChange(() => {
                updatePlayer(id, player.x, player.y);
                scene.updatePlayer(id, player.x, player.y);
            });
            addPlayer(player);
            scene.addPlayer(id, room!.sessionId === id, player.x, player.y);
            toast(`Utilizatorul ${id} s-a alăturat!`);

        });

        // ✅ Handle player disconnections
        $(room.state).players.onRemove((_, id) => {
            console.log("Player left:", id);
            removePlayer(id);
            scene.removePlayer(id, room!.sessionId === id);
            toast(`Utilizatorul ${id} s-a deconectat!`);

        });

        $(room.state).zones.onAdd((zone, id) => {
            $(zone).listen("isOpen",(val, prevVal) => {
                console.log("Zone updated:", zone.id, val, prevVal);
                scene.setZoneState(zone.id, val)
            })
           

        })
        room.onError((code, message) => {
            toast.error(`${message}`);

        })
        
        const createThrottledSendPlayerMove = (room: Room) =>
        throttle((payload: ColyseusEventPayloads[GameEvents.PLAYER_MOVE]) => {
            sendRoomEvent(room, GameEvents.PLAYER_MOVE, payload);
        }, 100);
          
        const createThrottledZoneChange = (room: Room) =>
        throttle((payload: ColyseusEventPayloads[GameEvents.CURRENT_ZONE]) => {
            sendRoomEvent(room, GameEvents.CURRENT_ZONE, { zoneId: payload.zoneId });
        }, 100);
        
        // Inside useEffect
        const throttledSendPlayerMove = createThrottledSendPlayerMove(room);
        const throttledSendZoneChange = createThrottledZoneChange(room);
        
        const onPlayerMove = (payload: ColyseusEventPayloads[GameEvents.PLAYER_MOVE]) => {
            throttledSendPlayerMove(payload);
        };
        
        const onDoorTrigger = (payload: ColyseusEventPayloads[GameEvents.DOOR_TRIGGER]) => {
            sendRoomEvent(room, GameEvents.DOOR_TRIGGER, { doorId: payload.doorId });
        };
        
        const onZoneChange = (payload: ColyseusEventPayloads[GameEvents.CURRENT_ZONE]) => {
            throttledSendZoneChange(payload);
        };
        
        // Subscribing
        scene.customEvents.on(GameEvents.PLAYER_MOVE, onPlayerMove);
        scene.customEvents.on(GameEvents.DOOR_TRIGGER, onDoorTrigger);
        scene.customEvents.on(GameEvents.CURRENT_ZONE, onZoneChange);
        return  () => {
            console.log("👋 Cleaning up GameManager...");
            scene.customEvents.off(GameEvents.PLAYER_MOVE, onPlayerMove);
            scene.customEvents.off(GameEvents.DOOR_TRIGGER, onDoorTrigger);
            scene.customEvents.off(GameEvents.CURRENT_ZONE, onZoneChange);
            //leaveRoom(); // ✅ Disconnect on unmount
        };
    }, [sceneLoaded, room]);

        return (
        
            <PhaserGame ref={phaserRef}/>
       
    );
};

export function sendRoomEvent<K extends keyof ColyseusEventPayloads>(
    room: Room,
    event: K,
    payload: ColyseusEventPayloads[K]
  ): void {
    if (room?.connection.isOpen) {
      room.send(event, payload);
    } 
  }