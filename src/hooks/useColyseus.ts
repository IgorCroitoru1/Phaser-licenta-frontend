import { useEffect, useRef, useState, useCallback } from "react";
import { Client, Room } from "colyseus.js";
import { RoomState } from "@/components/ChannelManager";
import GameConfig from "../../game-config";
import toast from "react-hot-toast";
import { GameEvents } from "@/game/common/common";
import { ColyseusEventPayloads } from "@/utils/colyseus-events";
import { ChannelUser } from "@/user/ChannelUser";
import { useChannelStore } from "@/store/useChannelStore";
export type GameRoomOptions = {
    mapId: string;
    token: string
  }

export function useColyseus() {
    const clientRef = useRef<Client | null>(null); // ✅ Persistent Colyseus client
    const [room, setRoom] = useState<Room<RoomState> | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [joinError, setJoinError] = useState(false);
    const addUser = useChannelStore((state) => state.addUser);
    // ✅ Initialize Colyseus Client Once
    useEffect(() => {
        if (!clientRef.current) {
            clientRef.current = new Client("ws://localhost:2567"); // Set your server URL
            
        }
    }, []);

    // ✅ Join or Switch Room
    const joinRoom = useCallback(async (roomName: string, options: GameRoomOptions) => {
        if (!clientRef.current) return;
        if (room && room.name === roomName) return; // Prevent rejoining same room

        setIsConnecting(true);
        setJoinError(false);

        try {
            console.log(`🔗 Joining room: ${roomName}...`);
            const newRoom = await clientRef.current.joinOrCreate<RoomState>(roomName, options);
            console.log("✅ Joined room:", newRoom.name);
              
            const onPlayerJoined = (user: ColyseusEventPayloads[GameEvents.PLAYER_JOINED]) => {
                const channelUser = new ChannelUser(user);
                channelUser.isLocal = newRoom.sessionId === user.colyseusId;
                addUser(channelUser);
            }
            setRoom(newRoom);
            setIsConnected(true);

          
            newRoom.onMessage(GameEvents.PLAYER_JOINED, onPlayerJoined);
            newRoom.onLeave((room, reason) => {
                console.log("❌ Room Disconnected. Reason:", reason);
                setIsConnected(false);
                setRoom(null);
            });
            newRoom.onError((code, message) => {
                console.error("❌ Room Error:", code, message);
            });
        } catch (error) {
            toast.error("A aparut o eroare la conectare. Vă rugăm să încercați din nou.");
            setJoinError(true);
        } finally {
            setIsConnecting(false);
        }
    }, [room]);

    // ✅ Leave Room
    const leaveRoom = useCallback(async () => {
        if (room && room.connection.isOpen && !isConnecting) {
            console.log("👋 Leaving room:", room.name);
            await room.leave();
            setIsConnected(false);
            setRoom(null);
        }
    }, [room, isConnecting]);

    useEffect(() => {
        return () => {
            if (room?.connection.isOpen) {
                room.leave();
                console.log("👋 Left room on unmount.");
            }
        };
    }, [room]);

    return {
        client: clientRef.current,
        room,
        isConnecting,
        isConnected,
        joinError,
        joinRoom,
        leaveRoom,
    };
}
