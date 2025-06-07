// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRoomManager } from '@/hooks/useRoomManager';

// export const SingleRoomPolicyDemo: React.FC = () => {
//   const { 
//     isConnected,
//     joinedChannels,
//     currentChannel,
//     isInAnyChannel,
//     joinChannel,
//     leaveCurrentChannel,
//     switchChannel,
//     requestToken,
//     getCurrentChannelToken,
//     loading,
//     error,
//     clearError
//   } = useRoomManager({
//     autoRequestToken: true,
//     onChannelJoined: (response) => {
//       console.log('✅ Channel joined:', response);
//       setEventLog(prev => [...prev, `✅ Joined channel: ${response.channelId}`]);
//     },
//     onChannelLeft: (channelId) => {
//       console.log('🚪 Channel left:', channelId);
//       setEventLog(prev => [...prev, `🚪 Left channel: ${channelId}`]);
//     },
//     onTokenReceived: (response) => {
//       console.log('🎥 LiveKit token received:', response);
//       setEventLog(prev => [...prev, `🎥 Token received for channel: ${response.channelId}`]);
//     },
//     onError: (errorMessage) => {
//       setEventLog(prev => [...prev, `❌ Error: ${errorMessage}`]);
//     }
//   });

// //   const [eventLog, setEventLog] = useState<string[]>([]);

// //   // Demo room options
// //   const demoRooms = [
// //     { id: 'room-1', name: 'Meeting Room 1', channelId: 'channel-1' },
// //     { id: 'room-2', name: 'Conference Room 2', channelId: 'channel-2' },
// //     { id: 'room-3', name: 'Gaming Room 3', channelId: 'channel-3' },
// //   ];
// //   const handleJoinRoom = async (roomId: string, channelId?: string) => {
// //     try {
// //       setEventLog(prev => [...prev, `🔄 Attempting to join room: ${roomId}`]);
// //       await joinChannel(roomId, channelId, { userAgent: 'demo-client' });
// //     } catch (err) {
// //       console.error('Failed to join room:', err);
// //     }
// //   };
// //   const handleSwitchRoom = async (roomId: string, channelId?: string) => {
// //     try {
// //       setEventLog(prev => [...prev, `🔄 Switching to room: ${roomId}`]);
// //       await switchChannel(roomId, channelId, { userAgent: 'demo-client' });
// //     } catch (err) {
// //       console.error('Failed to switch room:', err);
// //     }
// //   };
// //   const handleLeaveCurrentRoom = async () => {
// //     try {
// //       if (currentRoom) {
// //         setEventLog(prev => [...prev, `🚪 Leaving current room: ${currentRoom}`]);
// //         await leaveCurrentChannel();
// //       }
// //     } catch (err) {
// //       console.error('Failed to leave room:', err);
// //     }
// //   };

// //   const handleRequestToken = async () => {
// //     try {
// //       if (currentRoom) {
// //         setEventLog(prev => [...prev, `🎥 Requesting token for room: ${currentRoom}`]);
// //         await requestToken(currentRoom, 'demo-user');
// //       }
// //     } catch (err) {
// //       console.error('Failed to request token:', err);
// //     }
// //   };

// //   const clearLog = () => {
// //     setEventLog([]);
// //   };

// //   useEffect(() => {
// //     setEventLog(prev => [...prev, `🔌 WebSocket connected: ${isConnected}`]);
// //   }, [isConnected]);

// //   return (
// //     <div style={{ 
// //       padding: '20px', 
// //       maxWidth: '800px', 
// //       margin: '0 auto',
// //       fontFamily: 'Arial, sans-serif'
// //     }}>
// //       <h2 style={{ color: '#333', marginBottom: '20px' }}>
// //         🏠 Single Room Policy Demo
// //       </h2>

// //       {/* Connection Status */}
// //       <div style={{ 
// //         padding: '10px', 
// //         marginBottom: '20px', 
// //         backgroundColor: isConnected ? '#e8f5e8' : '#ffe8e8',
// //         border: `1px solid ${isConnected ? '#4caf50' : '#f44336'}`,
// //         borderRadius: '4px'
// //       }}>
// //         <strong>WebSocket Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}
// //       </div>

// //       {/* Current Room Status */}
// //       <div style={{ 
// //         padding: '15px', 
// //         marginBottom: '20px', 
// //         backgroundColor: '#f5f5f5',
// //         border: '1px solid #ddd',
// //         borderRadius: '4px'
// //       }}>
// //         <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Current Room Status</h3>
// //         <p><strong>Joined Rooms:</strong> {joinedRooms.size} (Max: 1)</p>
// //         <p><strong>Current Room:</strong> {currentRoom || 'None'}</p>
// //         <p><strong>In Any Room:</strong> {isInAnyRoom ? 'Yes' : 'No'}</p>
// //         <p><strong>Has Token:</strong> {getCurrentRoomToken() ? 'Yes' : 'No'}</p>
// //         {loading && <p style={{ color: '#ff9800' }}>⏳ Loading...</p>}
// //         {error && (
// //           <div style={{ color: '#f44336', marginTop: '10px' }}>
// //             ❌ {error}
// //             <button 
// //               onClick={clearError}
// //               style={{ 
// //                 marginLeft: '10px', 
// //                 padding: '2px 8px', 
// //                 fontSize: '12px',
// //                 backgroundColor: '#f44336',
// //                 color: 'white',
// //                 border: 'none',
// //                 borderRadius: '3px',
// //                 cursor: 'pointer'
// //               }}
// //             >
// //               Clear
// //             </button>
// //           </div>
// //         )}
// //       </div>

// //       {/* Room Actions */}
// //       <div style={{ marginBottom: '20px' }}>
// //         <h3 style={{ color: '#333', marginBottom: '15px' }}>Room Actions</h3>
        
// //         {/* Join Room Buttons */}
// //         <div style={{ marginBottom: '15px' }}>
// //           <h4 style={{ color: '#666', marginBottom: '10px' }}>Join Room (Single-room policy enforced)</h4>
// //           <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
// //             {demoRooms.map((room) => (
// //               <button
// //                 key={room.id}
// //                 onClick={() => handleJoinRoom(room.id, room.channelId)}
// //                 disabled={loading || !isConnected}
// //                 style={{
// //                   padding: '8px 12px',
// //                   backgroundColor: currentRoom === room.id ? '#4caf50' : '#2196f3',
// //                   color: 'white',
// //                   border: 'none',
// //                   borderRadius: '4px',
// //                   cursor: loading || !isConnected ? 'not-allowed' : 'pointer',
// //                   opacity: loading || !isConnected ? 0.6 : 1
// //                 }}
// //               >
// //                 {currentRoom === room.id ? '✅' : '🏠'} {room.name}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         {/* Switch Room Buttons */}
// //         <div style={{ marginBottom: '15px' }}>
// //           <h4 style={{ color: '#666', marginBottom: '10px' }}>Switch Room (Leaves current, joins new)</h4>
// //           <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
// //             {demoRooms.map((room) => (
// //               <button
// //                 key={`switch-${room.id}`}
// //                 onClick={() => handleSwitchRoom(room.id, room.channelId)}
// //                 disabled={loading || !isConnected || currentRoom === room.id}
// //                 style={{
// //                   padding: '8px 12px',
// //                   backgroundColor: '#ff9800',
// //                   color: 'white',
// //                   border: 'none',
// //                   borderRadius: '4px',
// //                   cursor: loading || !isConnected || currentRoom === room.id ? 'not-allowed' : 'pointer',
// //                   opacity: loading || !isConnected || currentRoom === room.id ? 0.6 : 1
// //                 }}
// //               >
// //                 🔄 Switch to {room.name}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         {/* Other Actions */}
// //         <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
// //           <button
// //             onClick={handleLeaveCurrentRoom}
// //             disabled={loading || !isConnected || !isInAnyRoom}
// //             style={{
// //               padding: '8px 12px',
// //               backgroundColor: '#f44336',
// //               color: 'white',
// //               border: 'none',
// //               borderRadius: '4px',
// //               cursor: loading || !isConnected || !isInAnyRoom ? 'not-allowed' : 'pointer',
// //               opacity: loading || !isConnected || !isInAnyRoom ? 0.6 : 1
// //             }}
// //           >
// //             🚪 Leave Current Room
// //           </button>

// //           <button
// //             onClick={handleRequestToken}
// //             disabled={loading || !isConnected || !isInAnyRoom}
// //             style={{
// //               padding: '8px 12px',
// //               backgroundColor: '#9c27b0',
// //               color: 'white',
// //               border: 'none',
// //               borderRadius: '4px',
// //               cursor: loading || !isConnected || !isInAnyRoom ? 'not-allowed' : 'pointer',
// //               opacity: loading || !isConnected || !isInAnyRoom ? 0.6 : 1
// //             }}
// //           >
// //             🎥 Request LiveKit Token
// //           </button>
// //         </div>
// //       </div>

// //       {/* Event Log */}
// //       <div style={{ 
// //         border: '1px solid #ddd',
// //         borderRadius: '4px',
// //         backgroundColor: '#fafafa'
// //       }}>
// //         <div style={{ 
// //           padding: '10px', 
// //           backgroundColor: '#333',
// //           color: 'white',
// //           display: 'flex',
// //           justifyContent: 'space-between',
// //           alignItems: 'center'
// //         }}>
// //           <h3 style={{ margin: 0 }}>📋 Event Log</h3>
// //           <button
// //             onClick={clearLog}
// //             style={{
// //               padding: '4px 8px',
// //               fontSize: '12px',
// //               backgroundColor: '#666',
// //               color: 'white',
// //               border: 'none',
// //               borderRadius: '3px',
// //               cursor: 'pointer'
// //             }}
// //           >
// //             Clear Log
// //           </button>
// //         </div>
// //         <div style={{ 
// //           height: '200px', 
// //           overflowY: 'auto',
// //           padding: '10px',
// //           fontSize: '14px',
// //           fontFamily: 'monospace'
// //         }}>
// //           {eventLog.length === 0 ? (
// //             <p style={{ color: '#666', fontStyle: 'italic' }}>No events yet...</p>
// //           ) : (
// //             eventLog.map((event, index) => (
// //               <div key={index} style={{ marginBottom: '4px' }}>
// //                 <span style={{ color: '#666' }}>[{new Date().toLocaleTimeString()}]</span> {event}
// //               </div>
// //             ))
// //           )}
// //         </div>
// //       </div>

// //       {/* Instructions */}
// //       <div style={{ 
// //         marginTop: '20px',
// //         padding: '15px',
// //         backgroundColor: '#e3f2fd',
// //         border: '1px solid #2196f3',
// //         borderRadius: '4px'
// //       }}>
// //         <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>📖 How Single-Room Policy Works:</h4>
// //         <ul style={{ marginLeft: '20px', color: '#333' }}>
// //           <li>Users can only be connected to <strong>one room at a time</strong></li>
// //           <li>When joining a new room, the system automatically leaves the current room first</li>
// //           <li>The WebSocket context enforces this policy at the lowest level</li>
// //           <li>The `useRoomManager` hook provides helper methods for room management</li>
// //           <li>LiveKit tokens are automatically managed and cleaned up when leaving rooms</li>
// //         </ul>
// //       </div>
// //     </div>
// //   );
// // };

// // export default SingleRoomPolicyDemo;
