import { useEffect, useRef, useState, useCallback } from "react";
import { Client, Room, ServerError } from "colyseus.js";
import { RoomState } from "@/components/ChannelManager";
import GameConfig from "../../game-config";
import toast from "react-hot-toast";
import { GameEvents } from "@/game/common/common";
import { ColyseusEventPayloads } from "@/utils/colyseus-events";
import { ChannelUser } from "@/user/ChannelUser";
import { useChannelStore } from "@/store/useChannelStore";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/useAuthStore";
export type GameRoomOptions = {
    mapId: string;
    token: string | null
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

    const joinRoom = useCallback(async (roomName: string, options: GameRoomOptions, retryCount = 0) => {
        if (!clientRef.current) return;
        if (room && room.name === roomName) return;
    
        setIsConnecting(true);
        setJoinError(false);
    
        try {
            console.log(`🔗 Joining room: ${roomName}...`);
            const newRoom = await clientRef.current.joinOrCreate<RoomState>(roomName, options);
            console.log("✅ Joined room:", newRoom.name, newRoom.roomId);
            
            const onPlayerJoined = (user: ColyseusEventPayloads[GameEvents.PLAYER_JOINED]) => {
                const channelUser = new ChannelUser(user);
                console.log("User joined:", channelUser);
                const storedUser = useAuthStore.getState().user;
                channelUser.isLocal = storedUser?.id === user.id;
                addUser(channelUser);
                toast(`Utilizatorul ${channelUser.name || channelUser.email} s-a alăturat`)
            }
            
            setRoom(newRoom);
            setIsConnected(true);
            newRoom.onMessage(GameEvents.INIT_USERS, (users: ColyseusEventPayloads[GameEvents.INIT_USERS]) => {
                users.map((user) => {
                    addUser(new ChannelUser(user));
                })
            })
            newRoom.onMessage(GameEvents.PLAYER_JOINED, onPlayerJoined);
            newRoom.onLeave((room, reason) => {
                console.log("❌ Room Disconnected. Reason:", reason);
                setIsConnected(false);
                setRoom(null);
            });
            
            newRoom.onError((code, message) => {
                console.error("❌ Room Error:", code, message);
            });

            newRoom.onMessage("players_data", (players) => {
                console.log("Received players:", players);
              });
    
        } catch (error) {
            console.error("❌ Error joining room:", error);
            
            // Handle authentication failure
            if (error instanceof Error && error.message === "onAuth failed" && retryCount < 1) {
                try {
                    console.log("🔄 Attempting to refresh tokens...");
                    await authService.refreshCredentials();
                    console.log("✅ Tokens refreshed, retrying join...");
                    return joinRoom(roomName, options, retryCount + 1);
                } catch (refreshError) {
                    console.error("❌ Token refresh failed:", refreshError);
                    toast.error("Session expired. Please log in again.");
                    // Optional: redirect to login or show login modal
                    // navigate('/login');
                }
            } else {
                toast.error("A apărut o eroare la conectare. Vă rugăm să încercați din nou.");
            }
            
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
