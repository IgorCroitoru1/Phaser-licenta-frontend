// hooks/useWebSocket.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { ChannelLiveData, ChannelUpdate, UserCounts } from '../types/websocket.types';
import { webSocketService } from '@/services/websocket';

interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  channelsData: ChannelLiveData[];
  userCounts: UserCounts;
  connect: (token: string) => Promise<void>;
  disconnect: () => void;
  retry: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelsData, setChannelsData] = useState<ChannelLiveData[]>([]);
  const [userCounts, setUserCounts] = useState<UserCounts>({});
  
  const tokenRef = useRef<string>('');

  const connect = useCallback(async (token: string) => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    setError(null);
    tokenRef.current = token;

    try {
      await webSocketService.connect(token, {
        onConnect: () => {
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
        },
        
        onDisconnect: (reason) => {
          setIsConnected(false);
          setIsConnecting(false);
          if (reason !== 'io client disconnect') {
            setError(`Connection lost: ${reason}`);
          }
        },
        
        onError: (err) => {
          setIsConnecting(false);
          setIsConnected(false);
          setError(err.message || 'Connection failed');
        },
        
        onInitialData: (data) => {
          setChannelsData(data);
          setError(null);
        },
        
        onChannelsUpdate: (data) => {
          setChannelsData(data);
        },
        
        onChannelUpdate: (update) => {
          setChannelsData(prev => 
            prev.map(channel => 
              channel.channelId === update.channelId 
                ? { ...channel, ...update.data }
                : channel
            )
          );
        },
        
        onUserCountsUpdate: (counts) => {
          setUserCounts(counts);
        },
      });
    } catch (err) {
      setIsConnecting(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  }, [isConnecting, isConnected]);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setChannelsData([]);
    setUserCounts({});
    setError(null);
  }, []);

  const retry = useCallback(() => {
    if (tokenRef.current) {
      connect(tokenRef.current);
    }
  }, [connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    channelsData,
    userCounts,
    connect,
    disconnect,
    retry,
  };
};