import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame"
import { Client, getStateCallbacks, Room } from "colyseus.js";
import { useRef, useState, useEffect, useCallback } from "react";
import GameConfig from "../../game-config";
import { MapSchema, Schema, type } from "@colyseus/schema";
import { useColyseus } from "@/hooks/useColyseus";
import { MyScene } from "@/game/scenes/MyScene";
import { GameEvents } from "@/game/common/common";
import { Position } from "@/game/common/types";
import { ColyseusEventPayloads } from "@/utils/colyseus-events";
import toast from "react-hot-toast";
import throttle from "lodash.throttle";
import { Channel, useChannelStore } from "@/store/useChannelStore";
import { ChannelUser } from "@/user/ChannelUser";
import { userRefsManager } from "@/user/UserRefsManager";
import { GameEventPayloads } from "@/game/Events";
import { useAuthStore } from "@/store/useAuthStore";
// constsceneRegistry = new Map<string, typeof Phaser.Scene>();
// sceneRegistry.set("TestScene", TestScene);
// sceneRegistry.set("MainMenu", MainMenu);
// sceneRegistry.set("MyScene", MyScene)ș
// export class Player extends Schema {
//     @type("string") id: string ;
//     @type("number") x: number ;
//     @type("number") y: number ;
//     @type("number") currentZoneId: number = -1;
// }
export class Player extends Schema {
    @type("string") id: string;
    @type("number") x: number;
    @type("number") y: number;
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

    onUncaughtException (err: Error, methodName: string) {
        console.error("An error ocurred in", methodName, ":", err);
        err.cause // original unhandled error
        err.message // original error message
    }
  }
export const ChannelManager = () => {
    const phaserRef = useRef<IRefPhaserGame>(null);
    const sceneLoaded = useChannelStore((state) => state.sceneLoaded);
    const user = useAuthStore((state) => state.user);
    const updateUserPosition = useChannelStore((state) => state.updateUserPosition);
    const removeUser = useChannelStore((state) => state.removeUser);
    const isGameLoaded = useChannelStore((state) => state.loaded);
    const { room, isConnected, joinRoom, leaveRoom } = useColyseus();
    const setSwitchChannel = useChannelStore((state) => state.setSwitchCannel);
    const setSceneLoaded = useChannelStore((state) => state.setSceneLoaded);
    const setActiveChannel = useChannelStore((state) => state.setActiveChannel);
    const clear = useChannelStore((state) => state.clear);
    const switchChannel = useCallback(async (channel: Channel): Promise<boolean> => {
        console.log("Switching channel");
        clear();
        const game = phaserRef.current?.game;
        if (!game) return false;
    
        const abortController = new AbortController();
    
        await leaveRoom();
    
        // Remove existing scene safely
        const currentSceneKey = 'MyScene';
        const existingScene = game.scene.getScene(currentSceneKey);
        
        if (existingScene) {
            game.scene.stop(currentSceneKey);
            game.scene.remove(currentSceneKey);
            setSceneLoaded(false);
            console.log("Scene stopped and removed");
        }
            const myScene = new MyScene(); // You might want to pass config her
            game.scene.add(currentSceneKey, myScene, true, { cfg: {name: channel.mapName} });
            //game.scene.start(currentSceneKey, { cfg: {name: newMapName} });
            console.log("Scene added and started");
       
        const currentToken = useAuthStore.getState().accessToken;
        try {
            await joinRoom(channel.colyseusRoomName, {
                mapId: channel.mapName,
                token: currentToken,
            });
            setActiveChannel(channel)
        } catch (error) {
            console.error("Failed to join room:", error);
            return false;
        }
    
        return new Promise((resolve) => {
            const unsubscribe = useChannelStore.subscribe((state) => {
                if (abortController.signal.aborted) {
                    unsubscribe();
                    return;
                }
    
                if (state.sceneLoaded) {
                    unsubscribe();
                    resolve(true);
                }
            });
    
            return () => {
                abortController.abort();
                unsubscribe();
            };
        });
    }, [phaserRef, isGameLoaded, room, joinRoom, leaveRoom]);
    

    useEffect(() => {
        setSwitchChannel(switchChannel);
    }, [switchChannel]);
    useEffect(() => {
       console.log("Switch scene recreatedd")

    }, [phaserRef, isGameLoaded , room, joinRoom, leaveRoom]); // ✅ Dependencies ensure it runs correctly

    useEffect(() => {
        const scene = phaserRef.current?.scene as MyScene;

        if (!scene || !room || !scene.sys || !scene.sys.isActive()) {
            console.warn("Scene is not ready or destroyed");
            return;
        }
        // useChannelStore.getState().setCamera(scene.cameras.main.zoom);
        console.log("Room use effect")
        console.log("Scene loaded:", sceneLoaded);
        const createThrottledSendPlayerMove = (room: Room) =>
        throttle((payload: ColyseusEventPayloads[GameEvents.PLAYER_MOVE]) => {
            sendRoomEvent(room, GameEvents.PLAYER_MOVE, payload);
        }, 70);
            
        const createThrottledZoneChange = (room: Room) =>
        throttle((payload: ColyseusEventPayloads[GameEvents.CURRENT_ZONE]) => {
            sendRoomEvent(room, GameEvents.CURRENT_ZONE, { zoneId: payload.zoneId });
        }, 100);
        
        const throttledSendPlayerMove = createThrottledSendPlayerMove(room);
        const throttledSendZoneChange = createThrottledZoneChange(room);
        
        const onLocalPlayerMove = (payload: ColyseusEventPayloads[GameEvents.PLAYER_MOVE]) => {
            throttledSendPlayerMove(payload);
        };
        
        const onDoorTrigger = (payload: ColyseusEventPayloads[GameEvents.DOOR_TRIGGER]) => {
            sendRoomEvent(room, GameEvents.DOOR_TRIGGER, { doorId: payload.doorId });
        };

        
        const onZoneChange = (payload: ColyseusEventPayloads[GameEvents.CURRENT_ZONE]) => {
            throttledSendZoneChange(payload);
        };
        
        const onCameraChange = (payload: GameEventPayloads[GameEvents.CAMERA_CHANGE]) => {
            userRefsManager.updateCamera(payload.worldX, payload.worldY, payload.scrollX, payload.scrollY, payload.zoom);
        }
        const onPlayersPositionUpdate = (payload: GameEventPayloads[GameEvents.PLAYERS_POSITION_UPDATE]) => {
            payload.forEach((player) => {
                userRefsManager.updateWorldPosition(player.id, player.x, player.y);
            })
        }
        // scene.customEvents.on(GameEvents.LOCAL_PLAYER_MOVED, (payload: GameEventPayloads[GameEvents.LOCAL_PLAYER_MOVED]) => {
        //     const ref = userRefsManager.getRef(payload.id)
        //     if(ref){
        //         ref.element.style.transform = `translate(${payload.x}px, ${payload.y}px) scale(${payload.zoom})`;
        //     }
        // })
        scene.customEvents.on(GameEvents.PLAYERS_POSITION_UPDATE, onPlayersPositionUpdate);
        scene.customEvents.on(GameEvents.PLAYER_MOVE, onLocalPlayerMove);
        scene.customEvents.on(GameEvents.DOOR_TRIGGER, onDoorTrigger);
        scene.customEvents.on(GameEvents.CURRENT_ZONE, onZoneChange);
        scene.customEvents.on(GameEvents.CAMERA_CHANGE, onCameraChange);

        
        const $ = getStateCallbacks(room);
       
        $(room.state).players.onAdd((player, id) => {
            $(player).onChange(() => {
                updateUserPosition(id, 
                    player.x,
                    player.y,
                );
                scene.updatePlayer(id, player.x, player.y);
                //userRefsManager.updateWorldPosition(id, player.x, player.y);
            });
            console.log("Player.id", player.id, user?.id);
            scene.addPlayer(id, id === user?.id, player.x, player.y);
            console.log(`Utilizatorul ${id} s-a alăturat ${room.sessionId} ${id}!`)
            toast(`Utilizatorul ${id} s-a alăturat ${room.sessionId} ${id}!`);

        });

        $(room.state).players.onRemove((player, id) => {
            console.log("Player left:", id);
            removeUser(player.id);
            scene.removePlayer(id);
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
        

       
        return  () => {
            //
            console.log("👋 Cleaning up GameManager...");
            scene.customEvents.off(GameEvents.PLAYERS_POSITION_UPDATE, onPlayersPositionUpdate);
            scene.customEvents.off(GameEvents.PLAYER_MOVE, onLocalPlayerMove);
            scene.customEvents.off(GameEvents.DOOR_TRIGGER, onDoorTrigger);
            scene.customEvents.off(GameEvents.CURRENT_ZONE, onZoneChange);
            scene.customEvents.off(GameEvents.CAMERA_CHANGE, onCameraChange);
        };
        
    }, [sceneLoaded, room]);

        useEffect(() => {
            console.log(user)
            return () => {
                const isMySceneActive = phaserRef.current?.game?.scene.isActive("MyScene");
                if(isMySceneActive) {
                    console.log("👋 Cleaning up MySceneeeeeee");
                    phaserRef.current?.game?.scene.stop("MyScene");
                    phaserRef.current?.game?.scene.remove("MyScene");
                }
            }
        },[])
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