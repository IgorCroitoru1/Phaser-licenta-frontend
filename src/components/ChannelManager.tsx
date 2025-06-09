import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame"
import { Client, getStateCallbacks, Room } from "colyseus.js";
import { useRef, useState, useEffect, useCallback } from "react";
import GameConfig from "../../game-config";
import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
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
import { set } from "react-hook-form";
import { use } from "matter";
import { Button } from "./ui/custom_button";
import { useRoomManager } from "@/hooks/useChannelManager";
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

  @type([ "string" ]) nearbyUsers = new ArraySchema<string>();
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
    const isGameLoaded = useChannelStore((state) => state.loaded);
    const addUser = useChannelStore((state) => state.addUser);
    const removeUser = useChannelStore((state) => state.removeUser);
    const { room, isConnected, joinRoom, leaveRoom } = useColyseus();
    const {joinChannel} = useRoomManager({
        
        onUserJoined: (data) => {
            toast(`Utilizatorul ${data.user.name} s-a conectat!`);

            addUser(new ChannelUser(data.user));
            
        },
        onUserLeft: (data) => {
            const leftUser = removeUser(data.userId);
            toast(`Utilizatorul ${leftUser?.name} a părăsit canalul!`);

        },
        onChannelJoined: (response) => {
            // if(user){
            //     const userDto = {
            //         id: user.id,
            //         name: user.name,
            //         email: user.email,
            //         avatar: user.avatar || "",
            //         currentZoneId: -1, // Default zone ID
            //     };
            //     const channelUser = new ChannelUser(userDto);
            //     channelUser.isLocal = true; // Mark as local user
            //     addUser(channelUser);
            // }
            response.users.forEach((user) => {
                const channelUser = new ChannelUser(user);
                channelUser.isLocal = user.id === user?.id;
                addUser(channelUser);
            })
        },
        onChannelLeft: (channelId) => {
        },
        onError: (error) => {
            toast.error(`Channel error: ${error}`);
        }
    });
    const switchChannel = useCallback(async (channel: Channel): Promise<boolean> => {
        console.log("Switching channel");
        useChannelStore.getState().clear();
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
            useChannelStore.getState().setSceneLoaded(false);
            console.log("Scene stopped and removed");
        }
            const myScene = new MyScene(); // You might want to pass config her
            game.scene.add(currentSceneKey, myScene, true, { cfg: {name: channel.mapName} });
            //game.scene.start(currentSceneKey, { cfg: {name: newMapName} });
            console.log("Scene added and started");
       
        const currentToken = useAuthStore.getState().accessToken;
        try {
            const response = await joinChannel(channel.id)
            if(response.success && channel.id === response.channelId) {
                //joining game room
                await joinRoom("channel", {
                // mapId: channel.mapName,
                token: currentToken,
                channelId: channel.id,
            });
            useChannelStore.getState().setActiveChannel(channel)

            }
           
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
    }, [phaserRef, isGameLoaded, room, joinRoom, leaveRoom,joinChannel]);
    

    useEffect(() => {
        useChannelStore.getState().setSwitchCannel(switchChannel);
    }, [switchChannel]);
    useEffect(() => {
       console.log("Switch scene recreatedd")

    }, [phaserRef, isGameLoaded , room, joinRoom, leaveRoom]); // ✅ Dependencies ensure it runs correctly

    useEffect(() => {
        const scene = phaserRef.current?.scene as MyScene;

        if (!scene || !room || !scene.sys || !scene.sys.isActive()) {
            console.warn("Scene is not ready or destroyed", scene, room);
            return;
        }
        console.log("Scene is ready", scene, room);
        // useChannelStore.getState().setCamera(scene.cameras.main.zoom);
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
            sendRoomEvent(room, GameEvents.DOOR_TRIGGER, { zoneId: payload.zoneId });
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
            // console.log("Player joined:", id, player);
            $(player).onChange(() => {
                // useChannelStore.getState().updateUserPosition(id, 
                //     player.x,
                //     player.y,
                // );
                scene.updatePlayer(id, player.x, player.y);
                //userRefsManager.updateWorldPosition(id, player.x, player.y);
            });
            $(player).listen("currentZoneId", (val, prevVal) => {
                // console.log("Player zone updated:", player.id, val, prevVal);
                useChannelStore.getState().updateUserZone(player.id, val);
                // scene.setPlayerZone(id, val);
            })
            // $(player).nearbyUsers.onChange((val, prevVal) => {
            //     useChannelStore.getState().setDebugNearbyUsers(player.id, player.nearbyUsers.toArray())
            // })
            $(player).nearbyUsers.onAdd((userId, index) => {
                //console.log("Added new near for user:", player.id, userId);
                if(user?.id === player.id) {
                    useChannelStore.getState().setNearbyUser(userId);
                    //console.log("Player nearby user added:" ,userId);
                }
               
            })
            $(player).nearbyUsers.onRemove((userId, index) => {
                if(user?.id === player.id) {
                useChannelStore.getState().removeNearbyUser(userId);
                }
                // console.log("Player nearby user removed:" ,userId);
            })
            $(player).listen("nearbyUsers", (val, prevVal) => {
                // console.log("Player nearby users updated:", player.id, val);
                useChannelStore.getState().updateNearbyUsers(val.toArray());
            })
            scene.addPlayer(id, id === user?.id, player.x, player.y);
            // console.log(`Utilizatorul ${id} s-a alăturat ${room.sessionId} ${id}!`)
            // toast(`Utilizatorul ${id} s-a alăturat ${room.sessionId} ${id}!`);

        });

        $(room.state).players.onRemove((player, id) => {
            useChannelStore.getState().removeUser(player.id);
            const user = useChannelStore.getState().users.get(id)
            scene.removePlayer(id);

        });

        $(room.state).zones.onAdd((zone, id) => {
            useChannelStore.getState().setZoneState(zone.id, zone.isOpen);
            $(zone).listen("isOpen",(val, prevVal) => {
                scene.setZoneState(zone.id, val)
                useChannelStore.getState().setZoneState(zone.id, val);
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
            return () => {
                useChannelStore.getState().clear();
                // userRefsManager
                const isMySceneActive = phaserRef.current?.game?.scene.isActive("MyScene");
                if(isMySceneActive) {
                    console.log("👋 Cleaning up MySceneeeeeee");
                    phaserRef.current?.game?.scene.stop("MyScene");
                    phaserRef.current?.game?.scene.remove("MyScene");
                }
            }
        },[])
        return (

            // {/* <Button onClick={()=>{
            //     console.log("Sending get_data message to room")
            //     console.log("room", room?.state.players.forEach((player, id) => {
            //         console.log("Player ID:", id, "Player Data:", player.nearbyUsers.toArray());
            //     }))
            //     // room?.send('get_data', { userId: "123" });
            //     }}>
            //     Get data
            //   </Button> */}
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