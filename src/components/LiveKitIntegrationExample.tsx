// 'use client';

// import React, { useState, useCallback } from 'react';
// import { useRoomManager } from '@/hooks/useRoomManager';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';

// // This would be your LiveKit component integration
// interface LiveKitRoomProps {
//   token: string;
//   serverUrl: string;
//   roomName: string;
//   identity: string;
//   onDisconnected?: () => void;
// }

// // Mock LiveKit component - replace with actual LiveKit implementation
// const LiveKitRoom: React.FC<LiveKitRoomProps> = ({ 
//   token, 
//   serverUrl, 
//   roomName, 
//   identity,
//   onDisconnected 
// }) => {
//   return (
//     <div className="p-4 border rounded bg-blue-50">
//       <h3 className="font-semibold">LiveKit Room: {roomName}</h3>
//       <p className="text-sm text-muted-foreground">Identity: {identity}</p>
//       <p className="text-sm text-muted-foreground">Server: {serverUrl}</p>
//       <div className="mt-2">
//         <Button size="sm" variant="outline" onClick={onDisconnected}>
//           Disconnect from LiveKit
//         </Button>
//       </div>
//       <div className="mt-2 text-xs font-mono bg-gray-100 p-2 rounded">
//         Token: {token.substring(0, 30)}...
//       </div>
//     </div>
//   );
// };

// export const LiveKitIntegrationExample: React.FC = () => {
//   const [roomIdInput, setRoomIdInput] = useState('');
//   const [identityInput, setIdentityInput] = useState('user123');
//   const [activeRoom, setActiveRoom] = useState<{
//     roomId: string;
//     token: string;
//     url: string;
//     identity: string;
//   } | null>(null);

//   const {
//     isConnected,
//     loading,
//     error,
//     joinedRooms,
//     joinRoomWithToken,
//     leaveRoom,
//     clearError
//   } = useRoomManager({
//     autoRequestToken: true,
//     onRoomJoined: (response) => {
//       console.log('✅ Room joined:', response);
//     },
//     onRoomLeft: (roomId) => {
//       console.log('🚪 Left room:', roomId);
//       // Clear active room if it's the one we left
//       if (activeRoom?.roomId === roomId) {
//         setActiveRoom(null);
//       }
//     },
//     onTokenReceived: (response) => {
//       console.log('🎥 Token received:', response);
//     },
//     onError: (error) => {
//       console.error('❌ Room error:', error);
//     }
//   });

//   const handleJoinWithLiveKit = useCallback(async () => {
//     if (!roomIdInput.trim()) return;

//     try {
//       const { roomResponse, tokenResponse } = await joinRoomWithToken(
//         roomIdInput.trim(),
//         identityInput.trim() || undefined,
//         undefined, // channelId
//         { source: 'livekit-integration' }
//       );

//       // Set up LiveKit room
//       setActiveRoom({
//         roomId: roomResponse.roomId,
//         token: tokenResponse.token,
//         url: tokenResponse.url,
//         identity: tokenResponse.identity
//       });

//       setRoomIdInput('');
//     } catch (err) {
//       console.error('Failed to join room with LiveKit:', err);
//     }
//   }, [roomIdInput, identityInput, joinRoomWithToken]);

//   const handleLeaveRoom = useCallback(async (roomId: string) => {
//     try {
//       await leaveRoom(roomId);
//       if (activeRoom?.roomId === roomId) {
//         setActiveRoom(null);
//       }
//     } catch (err) {
//       console.error('Failed to leave room:', err);
//     }
//   }, [leaveRoom, activeRoom]);

//   const handleLiveKitDisconnect = useCallback(() => {
//     if (activeRoom) {
//       setActiveRoom(null);
//       // Optionally also leave the WebSocket room
//       // handleLeaveRoom(activeRoom.roomId);
//     }
//   }, [activeRoom]);
//   return (
//     <div className="space-y-4 p-4">
//       <div className="border rounded-lg p-6 bg-white shadow-sm">
//         <div className="mb-4">
//           <h2 className="text-xl font-semibold">WebSocket + LiveKit Integration</h2>
//           <p className="text-gray-600 text-sm">
//             Join rooms via WebSocket and connect to LiveKit automatically
//           </p>
//         </div>
        
//         <div className="space-y-4">
//           {/* Connection Status */}
//           <div className="flex items-center gap-2">
//             <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
//             <span className="text-sm">
//               WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
//             </span>
//           </div>

//           {/* Error Display */}
//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded p-3">
//               <div className="flex items-center justify-between">
//                 <p className="text-red-800 text-sm">{error}</p>
//                 <Button 
//                   size="sm" 
//                   variant="outline" 
//                   className="ml-2" 
//                   onClick={clearError}
//                 >
//                   Clear
//                 </Button>
//               </div>
//             </div>
//           )}

//           {/* Join Room Form */}
//           {!activeRoom && (
//             <div className="space-y-2">
//               <h3 className="text-lg font-semibold">Join Room with LiveKit</h3>
//               <Input
//                 placeholder="Room ID"
//                 value={roomIdInput}
//                 onChange={(e) => setRoomIdInput(e.target.value)}
//                 disabled={!isConnected || loading}
//               />
//               <Input
//                 placeholder="Your identity"
//                 value={identityInput}
//                 onChange={(e) => setIdentityInput(e.target.value)}
//                 disabled={!isConnected || loading}
//               />
//               <Button 
//                 onClick={handleJoinWithLiveKit}
//                 disabled={!isConnected || loading || !roomIdInput.trim()}
//                 className="w-full"
//               >
//                 {loading ? 'Joining...' : 'Join Room & Connect LiveKit'}
//               </Button>
//             </div>
//           )}

//           {/* Active LiveKit Room */}
//           {activeRoom && (
//             <div className="space-y-2">
//               <h3 className="text-lg font-semibold">Active LiveKit Session</h3>
//               <LiveKitRoom
//                 token={activeRoom.token}
//                 serverUrl={activeRoom.url}
//                 roomName={activeRoom.roomId}
//                 identity={activeRoom.identity}
//                 onDisconnected={handleLiveKitDisconnect}
//               />
//             </div>
//           )}

//           {/* Joined Rooms Status */}
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold">
//               WebSocket Rooms ({joinedRooms.size})
//             </h3>
//             {joinedRooms.size === 0 ? (
//               <p className="text-gray-500">No rooms joined</p>
//             ) : (
//               <div className="space-y-2">
//                 {Array.from(joinedRooms).map((roomId) => (
//                   <div key={roomId} className="flex items-center justify-between p-3 border rounded">
//                     <div className="flex-1">
//                       <div className="font-medium">{roomId}</div>
//                       {activeRoom?.roomId === roomId && (
//                         <div className="text-sm text-green-600">
//                           ✅ LiveKit connected
//                         </div>
//                       )}
//                     </div>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => handleLeaveRoom(roomId)}
//                       disabled={loading}
//                     >
//                       Leave
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Integration Guide */}
//           <div className="mt-6 p-4 bg-blue-50 rounded">
//             <h4 className="font-semibold mb-2">Integration Guide</h4>
//             <ul className="text-sm space-y-1 text-gray-600">
//               <li>1. Enter a room ID and your identity</li>
//               <li>2. Click "Join Room & Connect LiveKit" to join via WebSocket</li>
//               <li>3. The system automatically requests a LiveKit token</li>
//               <li>4. LiveKit room connects using the received token</li>
//               <li>5. You can disconnect from LiveKit while staying in the WebSocket room</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LiveKitIntegrationExample;
