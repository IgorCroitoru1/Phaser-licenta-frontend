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
import { ChannelLiveData, ClientToServerEvents, ServerToClientEvents, TypedSocket } from '@/types/websocket.types';

interface SocketContextType {
  socket: React.RefObject <TypedSocket | null>;
  isConnected: boolean;
  connectionError: string | null;
  channelsData: ChannelLiveData[];
  emit: <T extends keyof ClientToServerEvents>(
    eventName: T, 
    ...data: Parameters<ClientToServerEvents[T]>
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
  url = 'http://localhost:3000/channels',
  options = {
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
  }
}) => {
  const socketRef = useRef<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [channelsData, setChannelsData] = useState<ChannelLiveData[]>([]);
  const isInitialized = useRef(false);

  const initializeSocket = () => {
    if (isInitialized.current || socketRef.current) {
      return;
    }

    console.log('🔌 Creating new WebSocket connection...');

    const socket: TypedSocket = io(url, options);
    isInitialized.current = true;

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server, Socket ID:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', (reason: string) => {
      console.log(`❌ Disconnected from WebSocket: ${reason}`);
      setIsConnected(false);
      setChannelsData([]);
    });

    socket.on('connect_error', (err: Error) => {
      console.log(`❌ Connect error due to ${err.message}`);
      setConnectionError(err.message);
      setIsConnected(false);
    });

    socket.on("channels:initial", (data)=>{
      setChannelsData(data);
    })
    // Listen to all events for debugging
    socket.onAny((eventName: string, ...args: any[]) => {
      console.log('📥 Received event:', eventName, args);
    });

    socketRef.current = socket;
  };

  const emit: SocketContextType['emit'] = (eventName, ...data) => {
    if (socketRef.current) {
      console.log(`📤 Sending event: ${String(eventName)}`, data);
      socketRef.current.emit(eventName, ...data);
    } else {
      console.error('❌ No socket connection');
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
    if (socketRef.current) {
      console.log('🔌 Manually disconnecting socket...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      isInitialized.current = false;
    }
  };

  const reconnect = () => {
    if (socketRef.current) {
      console.log('🔄 Reconnecting socket...');
      socketRef.current.connect();
    } else {
      initializeSocket();
    }
  };

  useEffect(() => {
    initializeSocket();

    return () => {
      if (socketRef.current) {
        console.log('🧹 Cleaning up WebSocket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        isInitialized.current = false;
      }
    };
  }, []);

  const contextValue: SocketContextType = {
    channelsData,
    socket: socketRef,
    isConnected,
    connectionError,
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
