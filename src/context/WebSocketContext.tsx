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
import { ChannelLiveData, ClientToServerEvents, ServerToClientEvents, SOCKET_EVENTS, TypedSocket, WithOptionalAck } from '@/types/websocket.types';
import { useAuthStore } from '@/store/useAuthStore';

interface SocketContextType {
  socket: React.RefObject<TypedSocket | null>;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  channelsData: ChannelLiveData[];
  reconnectAttempts: number;
  maxReconnectAttempts: number;
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
  const socketRef = useRef<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [channelsData, setChannelsData] = useState<ChannelLiveData[]>([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
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
    });

    socket.on('disconnect', (reason: string) => {
      console.log(`❌ Disconnected from WebSocket: ${reason}`);
      setIsConnected(false);
      setIsConnecting(false);
      setChannelsData([]);

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
    });
    // Server event listeners
    socket.on(SOCKET_EVENTS.CHANNELS_INITIAL, (data) => {
      console.log('📊 Received initial channels data:', data);
      setChannelsData(data);
    });

    socket.on(SOCKET_EVENTS.CHANNELS_UPDATE, (data) => {
      console.log('🔄 Received channels update:', data);
      setChannelsData(data);
    });

    socket.on(SOCKET_EVENTS.CHANNEL_UPDATE, (update) => {
      console.log('🎯 Received channel update:', update);
      setChannelsData(prev => 
        prev.map(channel => 
          channel.channelId === update.channelId 
            ? { ...channel, ...update.data }
            : channel
        )
      );
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
  };

  const disconnect = () => {
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
  };

  // Effect to handle token changes
  useEffect(() => {
    if (accessToken && !isInitialized.current) {
      console.log('🔑 Access token available - initializing socket connection');
      initializeSocket();
    } else if (!accessToken && socketRef.current) {
      console.log('🚫 Access token removed - disconnecting socket');
      disconnect();
    }

    return () => {
      shouldReconnect.current = false;
      clearReconnectTimeout();
      
      if (socketRef.current) {
        console.log('🧹 Cleaning up WebSocket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setIsConnecting(false);
        isInitialized.current = false;
      }
    };
  }, [accessToken]);

  const contextValue: SocketContextType = {
    channelsData,
    socket: socketRef,
    isConnected,
    isConnecting,
    connectionError,
    reconnectAttempts,
    maxReconnectAttempts,
    emit,
    on,
    off,
    disconnect,
    reconnect,
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
