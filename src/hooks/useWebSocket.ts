// // hooks/useWebSocket.ts
// import { useEffect, useState, useCallback, useRef } from 'react';
// import { ChannelLiveData, ChannelUpdate, UserCounts } from '../types/websocket.types';
// import { webSocketService } from '@/services/websocket';
// import { useAuthStore } from '@/store/useAuthStore';

// interface UseWebSocketReturn {
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

// export const useWebSocket = (): UseWebSocketReturn => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [channelsData, setChannelsData] = useState<ChannelLiveData[]>([]);
//   const [userCounts, setUserCounts] = useState<UserCounts>({});
  
//   // const tokenRef = useRef<string>('');
//   const { accessToken } = useAuthStore();

//   const connect = useCallback(async (token: string) => {
//     if (isConnecting || isConnected) return;
    
//     setIsConnecting(true);
//     setError(null);
//     // tokenRef.current = token;

//     try {
//       await webSocketService.connect(token, {
//         onConnect: () => {
//           setIsConnected(true);
//           setIsConnecting(false);
//           setError(null);
//         },
        
//         onDisconnect: (reason) => {
//           setIsConnected(false);
//           setIsConnecting(false);
//           if (reason !== 'io client disconnect') {
//             setError(`Connection lost: ${reason}`);
//           }
//         },
        
//         onError: (err) => {
//           setIsConnecting(false);
//           setIsConnected(false);
//           setError(err.message || 'Connection failed');
//         },
        
//         onInitialData: (data) => {
//           setChannelsData(data);
//           setError(null);
//         },
        
//         onChannelsUpdate: (data) => {
//           setChannelsData(data);
//         },
        
//         onChannelUpdate: (update) => {
//           setChannelsData(prev => 
//             prev.map(channel => 
//               channel.channelId === update.channelId 
//                 ? { ...channel, ...update.data }
//                 : channel
//             )
//           );
//         },
        
//         onUserCountsUpdate: (counts) => {
//           setUserCounts(counts);
//         },
//       });
//     } catch (err) {
//       setIsConnecting(false);
//       setError(err instanceof Error ? err.message : 'Connection failed');
//     }
//   }, [isConnecting, isConnected]);
//   const disconnect = useCallback(() => {
//     webSocketService.disconnect();
//     setIsConnected(false);
//     setIsConnecting(false);
//     setChannelsData([]);
//     setUserCounts({});
//     setError(null);
//   }, []);

//   const forceDisconnect = useCallback(() => {
//     webSocketService.forceDisconnect();
//     setIsConnected(false);
//     setIsConnecting(false);
//     setChannelsData([]);
//     setUserCounts({});
//     setError(null);
//     // tokenRef.current = '';
//   }, []);
//   const retry = useCallback(() => {
//     if (accessToken) {
//       connect(accessToken);
//     }
//   }, [connect]);

//   // Watch auth store token changes - auto connect/disconnect
//   useEffect(() => {
//     if (accessToken && !isConnected && !isConnecting) {
//       // Token available and not connected - auto connect
//       console.log('🔌 Auto-connecting WebSocket with token from store');
//       connect(accessToken);
//     } else if (!accessToken && (isConnected || isConnecting)) {
//       // Token removed but still connected - auto disconnect
//       console.log('🔌 Auto-disconnecting WebSocket - token removed from store');
//       forceDisconnect();
//     }
//   }, [accessToken, isConnected, isConnecting, connect, forceDisconnect]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       disconnect();
//     };
//   }, [disconnect]);

//   return {
//     isConnected,
//     isConnecting,
//     error,
//     channelsData,
//     userCounts,
//     connect,
//     disconnect,
//     forceDisconnect,
//     retry,
//   };
// };