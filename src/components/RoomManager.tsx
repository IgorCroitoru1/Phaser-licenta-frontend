// 'use client';

// import React, { useState } from 'react';
// import { useRoomManager } from '@/hooks/useRoomManager';

// export const RoomManager: React.FC = () => {
//   const { 
//     isConnected, 
//     joinedChannels, 
//     channelTokens, 
//     currentChannel,
//     isInAnyChannel,
//     joinChannel, 
//     leaveChannel,
//     leaveCurrentChannel,
//     switchChannel,
//     requestToken,
//     getChannelToken,
//     getCurrentChannelToken,
//     loading,
//     error,
//     clearError
//   } = useRoomManager({
//     autoRequestToken: true, // Auto-request tokens for joined channels
//     onChannelJoined: (response) => {
//       console.log('🏠 Channel joined:', response);
//       setSuccess(`Successfully joined channel: ${response.channelId}`);
//     },
//     onChannelLeft: (channelId) => {
//       console.log('🚪 Channel left:', channelId);
//       setSuccess(`Left channel: ${channelId}`);
//     },
//     onTokenReceived: (response) => {
//       console.log('🎥 LiveKit token received:', response);
//       setSuccess(`LiveKit token received for channel: ${response.channelId}`);
//     },
//     onError: (errorMessage) => {
//       console.error('ChannelManager error:', errorMessage);
//     }
//   });

//   const [channelIdInput, setChannelIdInput] = useState('');
//   const [success, setSuccess] = useState<string | null>(null);
//   const [localError, setLocalError] = useState<string | null>(null);

//   const handleJoinChannel = async () => {
//     if (!channelIdInput.trim()) {
//       setLocalError('Channel ID is required');
//       return;
//     }

//     setLocalError(null);
//     clearError();
//     setSuccess(null);

//     try {
//       await joinChannel(
//         channelIdInput.trim(), 
//         { joinedAt: new Date().toISOString() }
//       );
      
//       setChannelIdInput('');
//     } catch (err) {
//       // Error is handled by the hook's onError callback
//     }
//   };

//   const handleSwitchChannel = async () => {
//     if (!channelIdInput.trim()) {
//       setLocalError('Channel ID is required');
//       return;
//     }

//     setLocalError(null);
//     clearError();
//     setSuccess(null);

//     try {
//       await switchChannel(
//         channelIdInput.trim(), 
//         { joinedAt: new Date().toISOString() }
//       );
      
//       setChannelIdInput('');
//     } catch (err) {
//       // Error is handled by the hook's onError callback
//     }
//   };

//   const handleLeaveCurrentChannel = async () => {
//     setLocalError(null);
//     clearError();
//     setSuccess(null);

//     try {
//       await leaveCurrentChannel();
//     } catch (err) {
//       // Error is handled by the hook's onError callback
//     }
//   };

//   const handleRequestToken = async (channelId: string) => {
//     setLocalError(null);
//     clearError();
//     setSuccess(null);

//     try {
//       await requestToken(
//         channelId,
//         'user123', // You can get this from auth store
//         { requestedAt: new Date().toISOString() }
//       );
//     } catch (err) {
//       // Error is handled by the hook's onError callback
//     }
//   };

//   return (
//     <div className="space-y-4 p-4">
//       <div className="border rounded-lg p-6 bg-white shadow-sm">
//         <div className="mb-4">
//           <h2 className="text-xl font-semibold">Channel Management (Single Channel Policy)</h2>
//           <p className="text-gray-600 text-sm">
//             Join channels and manage LiveKit tokens through WebSocket. Only one channel at a time.
//           </p>
//         </div>
        
//         <div className="space-y-4">
//           {/* Connection Status */}
//           <div className="flex items-center gap-2">
//             <span className={`px-2 py-1 rounded text-xs font-medium ${
//               isConnected 
//                 ? "bg-green-100 text-green-800" 
//                 : "bg-red-100 text-red-800"
//             }`}>
//               {isConnected ? "Connected" : "Disconnected"}
//             </span>
//             {isInAnyChannel && (
//               <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
//                 In Channel: {currentChannel}
//               </span>
//             )}
//           </div>

//           {/* Error/Success Messages */}
//           {(error || localError) && (
//             <div className="bg-red-50 border border-red-200 rounded p-3">
//               <p className="text-red-800 text-sm">{error || localError}</p>
//               <button 
//                 onClick={() => {
//                   clearError();
//                   setLocalError(null);
//                 }}
//                 className="text-red-600 text-xs mt-1 underline"
//               >
//                 Clear
//               </button>
//             </div>
//           )}
          
//           {success && (
//             <div className="bg-green-50 border border-green-200 rounded p-3">
//               <p className="text-green-800 text-sm">{success}</p>
//               <button 
//                 onClick={() => setSuccess(null)}
//                 className="text-green-600 text-xs mt-1 underline"
//               >
//                 Clear
//               </button>
//             </div>
//           )}

//           {/* Join/Switch Channel Form */}
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold">
//               {isInAnyChannel ? 'Switch Channel' : 'Join Channel'}
//             </h3>
//             <input
//               type="text"
//               placeholder="Channel ID (required)"
//               value={channelIdInput}
//               onChange={(e) => setChannelIdInput(e.target.value)}
//               disabled={!isConnected || loading}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <div className="flex gap-2">
//               <button
//                 onClick={isInAnyChannel ? handleSwitchChannel : handleJoinChannel}
//                 disabled={!isConnected || loading || !channelIdInput.trim()}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
//               >
//                 {loading ? 'Processing...' : (isInAnyChannel ? 'Switch Channel' : 'Join Channel')}
//               </button>
//               {isInAnyChannel && (
//                 <button
//                   onClick={handleLeaveCurrentChannel}
//                   disabled={!isConnected || loading}
//                   className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300"
//                 >
//                   Leave Current Channel
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Current Channel Status */}
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold">
//               Current Channel Status
//             </h3>
//             {!isInAnyChannel ? (
//               <p className="text-gray-500">Not in any channel</p>
//             ) : (
//               <div className="p-3 border rounded bg-blue-50">
//                 <div className="font-medium">{currentChannel}</div>
//                 {getCurrentChannelToken() ? (
//                   <div className="text-sm text-green-600">
//                     ✅ LiveKit token available
//                   </div>
//                 ) : (
//                   <div className="flex gap-2 mt-2">
//                     <button
//                       onClick={() => handleRequestToken(currentChannel!)}
//                       disabled={loading}
//                       className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
//                     >
//                       Get LiveKit Token
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* LiveKit Tokens */}
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold">
//               LiveKit Tokens ({channelTokens.size})
//             </h3>
//             {channelTokens.size === 0 ? (
//               <p className="text-gray-500">No tokens available</p>
//             ) : (
//               <div className="space-y-2">
//                 {Array.from(channelTokens.entries()).map(([channelId, tokenData]) => (
//                   <div key={channelId} className="p-3 border rounded bg-green-50">
//                     <div className="font-medium">{channelId}</div>
//                     <div className="text-sm text-gray-600">
//                       Identity: {tokenData.identity}
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       URL: {tokenData.url}
//                     </div>
//                     <div className="text-xs font-mono bg-gray-100 p-1 rounded mt-1">
//                       Token: {tokenData.token.substring(0, 20)}...
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoomManager;
