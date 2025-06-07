import { Socket } from "socket.io-client";

export interface ChannelLiveData {
  channelId: string;
  clientsCount: number;
  roomsCount: number;
  isActive: boolean;
  metadata?: any;
}

export interface ChannelUpdate {
  channelId: string;
  data: ChannelLiveData;
}

export interface UserCounts {
  [channelId: string]: number;
}

export const SOCKET_EVENTS = {
  // Global channel events
  CHANNELS_INITIAL: 'channels:initial',
  CHANNELS_UPDATE: 'channels:update', 
  CHANNEL_UPDATE: 'channel:update',
  CHANNELS_USER_COUNTS: 'channels:userCounts',
  
  // Channel management events
  JOIN_CHANNEL: 'join-channel',
  LEAVE_CHANNEL: 'leave-channel',
  CHANNEL_JOINED: 'channel-joined',
  CHANNEL_JOIN_ERROR: 'channel-join-error',
  
  // User events in channels
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  
  // Message events
  CHANNEL_MESSAGE: 'channel-message',
  
  // LiveKit events
  REQUEST_LIVEKIT_TOKEN: 'request:livekit-token',
  LIVEKIT_TOKEN: 'livekit:token',
  
  // Channel data
  CHANNEL_DATA: 'channel:data',
  
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
} as const;


export interface ServerToClientEvents {
  // connect: () => void;
  // connect_error: (err: Error) => void;
  // disconnect: (reason: Socket.DisconnectReason, description?: any) => void;
  // noArg: () => void;
  // basicEmit: (a: number, b: string, c: Buffer) => void;
  // withAck: (d: string, callback: (e: number) => void) => void;
  message: (data: { type: string; message: string; timestamp: string }) => void;
  "hello-response": (data: { message: string; timestamp: string; serverTime: number }) => void;
  "user-joined": (userID: string) => void;
  "user-left": (userID: string) => void;
  "room-update": (data: { room: string; users: string[] }) => void;
  
  // ✅ Use computed property names with brackets
  [SOCKET_EVENTS.CHANNELS_INITIAL]: (data: ChannelLiveData[]) => void;
  [SOCKET_EVENTS.CHANNELS_UPDATE]: (data: ChannelLiveData[]) => void;
  [SOCKET_EVENTS.CHANNEL_UPDATE]: (data: ChannelUpdate) => void;
  [SOCKET_EVENTS.CHANNELS_USER_COUNTS]: (data: UserCounts) => void;
  
  error: (message: string) => void;
}
export interface ClientToServerEvents {
  joinRoom: (name: string) => void;
  hello: (data: { name: string; timestamp: string }) => void;
  "custom-event": (data: { type: string; data: string; timestamp: string }) => void;
  "quick-message": (data: { message: string; timestamp: string }) => void;
  leaveRoom: (userID: string) => void;
  "chat-message": (data: { message: string; user: string; room: string }) => void;
}




// Type alias for the properly typed socket client
export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;


export type SocketEventType = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];