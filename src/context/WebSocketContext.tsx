// 'use client'
// // contexts/WebSocketContext.tsx
// import React, { createContext, useContext, ReactNode } from 'react';
// import { useWebSocket } from '../hooks/useWebSocket';
// import { ChannelLiveData, UserCounts } from '../types/websocket.types';

// interface WebSocketContextType {
//   isConnected: boolean;
//   isConnecting: boolean;
//   error: string | null;
//   channelsData: ChannelLiveData[];
//   userCounts: UserCounts;
//   connect: (token: string) => Promise<void>;
//   disconnect: () => void;
//   forceDisconnect: () => void;
//   retry: () => void;
// }

// const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// interface WebSocketProviderProps {
//   children: ReactNode;
// }

// export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
//   const webSocket = useWebSocket();

//   return (
//     <WebSocketContext.Provider value={webSocket}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// export const useWebSocketContext = (): WebSocketContextType => {
//   const context = useContext(WebSocketContext);
//   if (!context) {
//     throw new Error('useWebSocketContext must be used within a WebSocketProvider');
//   }
//   return context;
// };

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { ChannelLiveData, ClientToServerEvents, ServerToClientEvents, SOCKET_EVENTS, TypedSocket, WithOptionalAck, ChannelJoinRequest, ChannelJoinResponse, LiveKitTokenResponse } from '@/types/websocket.types';
import { useAuthStore } from '@/store/useAuthStore';

interface SocketContextType {
  socket: React.RefObject<TypedSocket | null>;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  channelsData: ChannelLiveData[];
  reconnectAttempts: number;
  maxReconnectAttempts: number;
    // Current joined channel state (single channel only)
  currentChannel: string | null;
  channelToken: { token: string; channelId: string } | null;
  
  // Socket methods
  emit: <T extends keyof ClientToServerEvents>(
    eventName: T, 
    ...args: Parameters<WithOptionalAck<ClientToServerEvents>[T]>
  ) => void;
  on: <T extends keyof ServerToClientEvents>(
    eventName: T,
    callback: ServerToClientEvents[T]
  ) => void;
  off: <T extends keyof ServerToClientEvents>(
    eventName: T,
    callback: ServerToClientEvents[T]
  ) => void;
  disconnect: () => void;
  reconnect: () => void;
    // Channel management methods
  joinChannel: (channelId: string, ) => Promise<ChannelJoinResponse>;
  leaveChannel: (channelId?: string) => Promise<void>;
  requestLivekitToken: (channelId: string) => Promise<LiveKitTokenResponse>;
  getChannelToken: () => { token: string; channelId: string } | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: React.ReactNode;
  url?: string;
  options?: {
    transports?: string[];
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    timeout?: number;
  };
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ 
  children, 
  url = `${process.env.NEXT_PUBLIC_WS_URL}/channels`,
  options = {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    timeout: 20000,
  }
}) => {
  const socketRef = useRef<TypedSocket | null>(null);  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [channelsData, setChannelsData] = useState<ChannelLiveData[]>([]);  
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [channelToken, setChannelToken] = useState<{ token: string; channelId: string } | null>(null);
  const maxReconnectAttempts = options.reconnectionAttempts || 5;
  const reconnectDelay = options.reconnectionDelay || 3000;
  
  const isInitialized = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnect = useRef(true);
  
  // Get access token from auth store
  const accessToken = useAuthStore((state) => state.accessToken);

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const attemptReconnect = () => {
    if (!shouldReconnect.current || !accessToken) {
      console.log('🚫 Reconnection cancelled - no token or reconnection disabled');
      return;
    }

    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log(`🚫 Max reconnection attempts (${maxReconnectAttempts}) reached`);
      setConnectionError('Max reconnection attempts reached');
      return;
    }

    const attempt = reconnectAttempts + 1;
    setReconnectAttempts(attempt);
    
    console.log(`🔄 Reconnection attempt ${attempt}/${maxReconnectAttempts} in ${reconnectDelay}ms...`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`🔄 Executing reconnection attempt ${attempt}`);
      initializeSocket();
    }, reconnectDelay);
  };

  const initializeSocket = () => {
    if (!accessToken) {
      console.log('🚫 No access token available - skipping socket connection');
      setIsConnecting(false);
      return;
    }

    if (socketRef.current?.connected) {
      console.log('✅ Socket already connected');
      return;
    }

    console.log('🔌 Creating new WebSocket connection...');
    setIsConnecting(true);
    setConnectionError(null);

    // Clear any existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket: TypedSocket = io(url, {
      ...options,
      auth: { token: accessToken },
      forceNew: true,
    });

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server, Socket ID:', socket.id);
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      setReconnectAttempts(0); // Reset reconnect attempts on successful connection
      shouldReconnect.current = true;
      clearReconnectTimeout();
    });    socket.on('disconnect', (reason: string) => {
      console.log(`❌ Disconnected from WebSocket: ${reason}`);
      setIsConnected(false);
      setIsConnecting(false);
      setChannelsData([]);
      setCurrentChannel(null);
      setChannelToken(null);

      // Only attempt reconnection for certain disconnect reasons
      if (reason === 'io server disconnect') {
        console.log('🚫 Server disconnected - not attempting reconnection');
        shouldReconnect.current = false;
      } else if (reason === 'io client disconnect') {
        console.log('🚫 Client disconnected manually - not attempting reconnection');
        shouldReconnect.current = false;
      } else {
        console.log('🔄 Unexpected disconnect - will attempt reconnection');
        attemptReconnect();
      }
    });

    socket.on('connect_error', (err: Error) => {
      console.log(`❌ Connect error: ${err.message}`);
      setConnectionError(err.message);
      setIsConnected(false);
      setIsConnecting(false);
      
      // Attempt reconnection on connection error
      attemptReconnect();
    });
    socket.emit("channel-message", {message: "Hello from client", channelId: "123"}, (ack:any)=> {
      console.log("Message sent successfully, server ack:", ack);
    });    // Server event listeners


    socket.on(SOCKET_EVENTS.CHANNELS_UPDATE, (data) => {
      console.log('🔄 Received channels update:', data);
      setChannelsData(data);
    });    socket.on(SOCKET_EVENTS.CHANNEL_UPDATE, (update) => {
      console.log('🎯 Received channel update:', update);
      setChannelsData(prev => {
        // Check if channel exists in current state
        const channelExists = prev.some(channel => channel.channelId === update.channelId);
        
        if (!channelExists) {
          // Add new channel if it doesn't exist
          return [...prev, update];
        }
        
        // Update existing channel
        return prev.map(channel => 
          channel.channelId === update.channelId 
            ? { ...channel, ...update }
            : channel
        );
      });
    });// Channel management event listeners
    socket.on(SOCKET_EVENTS.CHANNEL_JOINED, (data: ChannelJoinResponse) => {
      console.log('🏠 Channel joined successfully:', data);
      if (data.success) {
        setCurrentChannel(data.channelId);
        if (data.livekitToken) {
          setChannelToken({ 
            token: data.livekitToken, 
            channelId: data.channelId,
          });
        }
      }
    });    socket.on(SOCKET_EVENTS.CHANNEL_LEFT, (data) => {
      console.log('🚪 Channel left:', data);
      if (data.success) {
        setCurrentChannel(null);
        setChannelToken(null);
      }
    });

    socket.on(SOCKET_EVENTS.CHANNEL_JOIN_ERROR, (error: string) => {
      console.error('❌ Channel join error:', error);
      setConnectionError(`Channel join failed: ${error}`);
    });    socket.on(SOCKET_EVENTS.LIVEKIT_TOKEN_RESPONSE, (data: LiveKitTokenResponse) => {
      console.log('🎥 LiveKit token received:', data);
      if (currentChannel === data.channelId) {
        setChannelToken({ 
          token: data.token, 
          channelId: data.channelId,
        });
      }
    });

    // Listen to all events for debugging
    socket.onAny((eventName: string, ...args: any[]) => {
      console.log('📥 Received event:', eventName, args);
    });

    socketRef.current = socket;
    isInitialized.current = true;
  };

  const emit: SocketContextType['emit'] = (eventName, ...data) => {
    if (socketRef.current?.connected) {
      console.log(`📤 Sending event: ${String(eventName)}`, data);
      (socketRef.current.emit as any)(eventName, ...data);
    } else {
      console.error('❌ Cannot emit - socket not connected');
      setConnectionError('Socket not connected');
    }
  };
  const on: SocketContextType['on'] = (eventName, callback) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback as any);
    } else {
      console.warn(`⚠️ Trying to listen to event "${String(eventName)}" but socket is not initialized`);
    }
  };

  const off: SocketContextType['off'] = (eventName, callback) => {
    if (socketRef.current) {
      socketRef.current.off(eventName, callback as any);
    } else {
      console.warn(`⚠️ Trying to remove listener for event "${String(eventName)}" but socket is not initialized`);
    }
  };  const disconnect = () => {
    console.log('🔌 Manually disconnecting socket...');
    shouldReconnect.current = false; // Prevent automatic reconnection
    clearReconnectTimeout();
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setReconnectAttempts(0);
    setChannelsData([]);
    setCurrentChannel(null);
    setChannelToken(null);
    isInitialized.current = false;
  };
  const reconnect = () => {
    console.log('🔄 Manual reconnection requested...');
    shouldReconnect.current = true;
    setReconnectAttempts(0);
    clearReconnectTimeout();
    disconnect();
    
    setTimeout(() => {
      initializeSocket();
    }, 1000);
  };  // Channel management functions
  const joinChannel = async (channelId: string, metadata?: any): Promise<ChannelJoinResponse> => {
    return new Promise(async (resolve, reject) => {
      if (!socketRef.current?.connected) {
        const error = 'Socket not connected';
        console.error('❌ Cannot join channel - socket not connected');
        reject(new Error(error));
        return;
      }

      try {
        // Enforce single-channel policy: leave current channel before joining new one
        if (currentChannel && currentChannel !== channelId) {
          console.log(`🚪 Single-channel policy: Leaving current channel ${currentChannel} before joining ${channelId}`);
          
          try {
            await leaveChannel(currentChannel);
            console.log(`✅ Left channel ${currentChannel} successfully`);
          } catch (leaveError) {
            console.warn(`⚠️ Failed to leave channel ${currentChannel}:`, leaveError);
            // Continue with joining the new channel even if leaving fails
          }
        }

        console.log(`🏠 Joining channel: ${channelId}`, { metadata });
        
        const request: ChannelJoinRequest = { channelId, metadata };
        
        // Use acknowledgment to get immediate response
        socketRef.current.emit(SOCKET_EVENTS.JOIN_CHANNEL, request, (response: ChannelJoinResponse) => {
          console.log('🏠 Channel join response:', response);
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error || 'Failed to join channel'));
          }
        });
      } catch (error) {
        console.error('❌ Error during channel join process:', error);
        reject(error);
      }
    });
  };  const leaveChannel = async (channelId?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        const error = 'Socket not connected';
        console.error('❌ Cannot leave channel - socket not connected');
        reject(new Error(error));
        return;
      }

      // Use current channel if no channelId provided
      const targetChannelId = channelId || currentChannel;
      
      if (!targetChannelId) {
        console.log('ℹ️ No channel to leave');
        resolve();
        return;
      }

      console.log(`🚪 Leaving channel: ${targetChannelId}`);
      
      socketRef.current.emit(SOCKET_EVENTS.LEAVE_CHANNEL, { channelId: targetChannelId }, (response: any) => {
        console.log('🚪 Channel leave response:', response);
        if (response?.success !== false) {
          // Remove from local state immediately
          setCurrentChannel(null);
          setChannelToken(null);
          resolve();
        } else {
          reject(new Error(response?.error || 'Failed to leave channel'));
        }
      });
    });
  };
  const requestLivekitToken = async (channelId: string, identity?: string, metadata?: any): Promise<LiveKitTokenResponse> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        const error = 'Socket not connected';
        console.error('❌ Cannot request LiveKit token - socket not connected');
        reject(new Error(error));
        return;
      }

      console.log(`🎥 Requesting LiveKit token for channel: ${channelId}`, { identity, metadata });
      
      const request = { channelId, identity, metadata };
      
      socketRef.current.emit(SOCKET_EVENTS.REQUEST_LIVEKIT_TOKEN, request, (response: LiveKitTokenResponse) => {
        console.log('🎥 LiveKit token response:', response);
        if (response.token) {
          resolve(response);
        } else {
          reject(new Error('Failed to get LiveKit token'));
        }
      });
    });
  };  
  const getChannelToken = (): { token: string; channelId: string } | null => {
    return channelToken;
  };

  // Effect to handle token changes
  useEffect(() => {
    if (accessToken && !isInitialized.current) {
      console.log('🔑 Access token available - initializing socket connection');
      initializeSocket();
    } else if (!accessToken && socketRef.current) {
      console.log('🚫 Access token removed - disconnecting socket');
      disconnect();
    }    return () => {
      shouldReconnect.current = false;
      clearReconnectTimeout();
      
      if (socketRef.current) {
        console.log('🧹 Cleaning up WebSocket connection');        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setIsConnecting(false);
        setChannelsData([]);
        setCurrentChannel(null);
        setChannelToken(null);
        isInitialized.current = false;
      }
    };
  }, [accessToken]);  const contextValue: SocketContextType = {
    channelsData,
    socket: socketRef,
    isConnected,
    isConnecting,
    connectionError,
    reconnectAttempts,
    maxReconnectAttempts,
    currentChannel,
    channelToken,
    emit,
    on,
    off,
    disconnect,
    reconnect,
    joinChannel,
    leaveChannel,
    requestLivekitToken,
    getChannelToken,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
