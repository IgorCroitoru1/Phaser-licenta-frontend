import { ChannelUserDto } from "@/dtos/ChannelUserDto";
import { Socket } from "socket.io-client";

export interface ChannelLiveData {
  channelId: string;
  clientsCount: number;
  // roomsCount: number;
  isActive: boolean;
  // metadata?: any;
}



export interface UserCounts {
  [channelId: string]: number;
}



export class ChannelUserLeftResponse {
  userId: string;

  channelId: string;
}
export class ChannelUserJoinResponse {
  user: ChannelUserDto;

  channelId: string;
}
// Room management types
export interface ChannelJoinRequest {
  channelId: string;
  metadata?: any;
}

export interface ChannelJoinResponse {
  success: boolean;
  users: ChannelUserDto[];
  channelId: string;
  liveKitToken?: string;
  error?: string;
}

export interface ChannelLeftResponse {
  success: boolean;
  channelId: string;
  error?: string;
}

export interface LiveKitTokenRequest {
  channelId: string;
}

export interface LiveKitTokenResponse {
  token: string;
  channelId: string;
}

export const SOCKET_EVENTS = {
  // Global channel events
  CHANNELS_UPDATE: 'channels:update', 
  CHANNEL_UPDATE: 'channel:update',
  CHANNELS_USER_COUNTS: 'channels:userCounts',
  
  // Channel management events
  JOIN_CHANNEL: 'join-channel',
  LEAVE_CHANNEL: 'leave-channel',
  CHANNEL_JOINED: 'channel-joined',
  CHANNEL_JOIN_ERROR: 'channel-join-error',
  CHANNEL_LEFT: 'channel-left',
  // Room management events
  // JOIN_ROOM: 'join-room',
  // LEAVE_ROOM: 'leave-room',
  // ROOM_JOINED: 'room-joined',
  // ROOM_LEFT: 'room-left',
  // ROOM_JOIN_ERROR: 'room-join-error',
  
  // User events in channels
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  
  // Message events
  CHANNEL_MESSAGE: 'channel-message',
  
  // LiveKit events
  REQUEST_LIVEKIT_TOKEN: 'request:livekit-token',
  LIVEKIT_TOKEN: 'livekit:token',
  LIVEKIT_TOKEN_RESPONSE: 'livekit:token-response',
  
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
  [SOCKET_EVENTS.USER_LEFT]: (data:ChannelUserLeftResponse) => void;
  "room-update": (data: { room: string; users: string[] }) => void;
  [SOCKET_EVENTS.USER_JOINED]: (data: ChannelUserJoinResponse) => void;
  // ✅ Use computed property names with brackets
  [SOCKET_EVENTS.CHANNELS_UPDATE]: (data: ChannelLiveData[]) => void;
  [SOCKET_EVENTS.CHANNEL_UPDATE]: (data: ChannelLiveData) => void;
  [SOCKET_EVENTS.CHANNELS_USER_COUNTS]: (data: UserCounts) => void;
  
  // Room events from server
  [SOCKET_EVENTS.CHANNEL_JOINED]: (data: ChannelJoinResponse) => void;
  [SOCKET_EVENTS.CHANNEL_LEFT]: (data: ChannelLeftResponse) => void;
  [SOCKET_EVENTS.CHANNEL_JOIN_ERROR]: (error: string) => void;
  
  // LiveKit events from server
  [SOCKET_EVENTS.LIVEKIT_TOKEN_RESPONSE]: (data: LiveKitTokenResponse) => void;
  
  error: (message: string) => void;
}
export interface ClientToServerEvents {
  joinRoom: (name: string) => void;
  hello: (data: { name: string; timestamp: string }) => void;
  "custom-event": (data: { type: string; data: string; timestamp: string }) => void;
  "quick-message": (data: { message: string; timestamp: string }) => void;
  leaveRoom: (userID: string) => void;
  "chat-message": (data: { message: string; user: string; room: string })  => void;
  [SOCKET_EVENTS.CHANNEL_MESSAGE]: (data: { channelId: string; message: string; }) => void;
  
  // Room management events to server
  [SOCKET_EVENTS.JOIN_CHANNEL]: (data: ChannelJoinRequest) => void;
  [SOCKET_EVENTS.LEAVE_CHANNEL]: (data: { channelId: string }) => void;
  
  // LiveKit token request
  [SOCKET_EVENTS.REQUEST_LIVEKIT_TOKEN]: (data: LiveKitTokenRequest) => void;
}


export type WithOptionalAck<T> = {
  [K in keyof T]: T[K] extends (...args: infer P) => void 
    ? (...args: [...P, ack?: (response: any) => void]) => void 
    : T[K];
};

// Type alias for the properly typed socket client
export type TypedSocket = Socket<ServerToClientEvents, WithOptionalAck<ClientToServerEvents> >;


export type SocketEventType = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];